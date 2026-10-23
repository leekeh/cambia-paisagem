import { useEffect, useImperativeHandle, useState, type Ref } from "react";
import {
  Modal,
  Button,
  TextInput,
  NumberInput,
  Textarea,
  Stack,
  Group,
  Text,
} from "@mantine/core";
import { DatePickerInput, TimePicker } from "@mantine/dates";
import "@mantine/dates/styles.css";
import { useForm } from "@mantine/form";
import "dayjs/locale/pt";
import "dayjs/locale/de";
import type { Translations } from "../i18n/pt";
import MantineProvider from "./MantineProvider";
import {
  submitFormWithStatus,
  toTransferPayload,
  type ApiRequestResult,
  type FormStatus,
  validateEmail,
  validatePhone,
} from "../lib/apiClient";
import { useTurnstile } from "../hooks/useTurnstile";

interface Props {
  lang: string;
  openSignal?: number;
  onReady?: () => void;
  ref?: Ref<TransferToolHandle>;
  transferType?: string;
  modalTitle?: string;
  pickupPlaceholder?: string;
  dropoffPlaceholder?: string;
  translations: {
    transfer: Translations["transfer"];
  };
}

/** Input accepted by the transfer booking WebMCP tool, see TransferBookingModal.tsx. */
export interface TransferToolInput {
  name?: string;
  email?: string;
  phone?: string;
  pickup?: string;
  dropoff?: string;
  /** ISO 8601 date (YYYY-MM-DD). */
  date?: string;
  /** 24h time, as HH:MM. */
  time?: string;
  people?: number;
  note?: string;
}

export interface TransferToolHandle {
  /** Opens the modal (if needed), fills in the form, validates it, and submits it. */
  fillAndSubmit(input: TransferToolInput): Promise<ApiRequestResult>;
}

export default function TransferBookingModalInner({
  ref,
  ...props
}: Props) {
  return (
    <MantineProvider>
      <TransferBookingModalInnerContent {...props} ref={ref} />
    </MantineProvider>
  );
}

function TransferBookingModalInnerContent({
  lang,
  transferType,
  modalTitle,
  pickupPlaceholder,
  dropoffPlaceholder,
  translations: tr,
  openSignal = 0,
  onReady,
  ref,
}: Props) {
  const [opened, setOpened] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const turnstile = useTurnstile();

  useEffect(() => {
    if (openSignal > 0) {
      setOpened(true);
    }
  }, [openSignal]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      type: transferType ?? "transfer",
      pickup: "",
      dropoff: "",
      date: null as Date | null,
      time: "",
      people: 1,
      note: "",
    },
    validate: {
      name: (v) => (!v ? `${tr.transfer.name} ${tr.transfer.required}` : null),
      email: (v) => {
        if (!v) return `${tr.transfer.email} ${tr.transfer.required}`;
        const emailError = validateEmail(v);
        return emailError ? tr.transfer.emailInvalid : null;
      },
      phone: (v) => {
        const phoneError = validatePhone(v);
        return phoneError ? tr.transfer.phoneInvalid : null;
      },
      pickup: (v) =>
        !v ? `${tr.transfer.pickup} ${tr.transfer.required}` : null,
      dropoff: (v) =>
        !v ? `${tr.transfer.dropoff} ${tr.transfer.required}` : null,
      time: (v) => {
        if (!v) return null;
        const trimmed = v.trim();
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(trimmed)
          ? null
          : tr.transfer.timeInvalid;
      },
    },
  });

  const getFieldA11y = (field: keyof typeof form.values) => {
    const message = form.errors[field];
    if (typeof message !== "string" || message.length === 0) {
      return {};
    }

    const errorId = `transfer-${String(field)}-error`;
    return {
      error: <span id={errorId}>{message}</span>,
      "aria-invalid": true,
      "aria-describedby": errorId,
    };
  };

  async function handleSubmit(
    values: typeof form.values,
  ): Promise<ApiRequestResult> {
    const token = turnstile.token ?? (await turnstile.waitForToken());
    if (turnstile.enabled && !token) {
      setStatus("error");
      return { ok: false, error: "Verification not ready, please try again." };
    }

    const result = await submitFormWithStatus({
      form,
      values,
      setStatus,
      endpoint: "/api/transfer",
      logLabel: "Transfer booking",
      toPayload: (currentValues) =>
        toTransferPayload(currentValues, lang, token ?? ""),
    });
    turnstile.reset();
    return result;
  }

  useImperativeHandle(ref, (): TransferToolHandle => ({
    async fillAndSubmit(input) {
      setOpened(true);
      form.setValues({
        name: input.name ?? "",
        email: input.email ?? "",
        phone: input.phone ?? "",
        pickup: input.pickup ?? "",
        dropoff: input.dropoff ?? "",
        date: input.date ? new Date(input.date) : null,
        time: input.time ?? "",
        people: input.people ?? 1,
        note: input.note ?? "",
      });

      const { hasErrors, errors } = form.validate();
      if (hasErrors) {
        return {
          ok: false,
          error: Object.entries(errors)
            .map(([field, message]) => `${field}: ${String(message)}`)
            .join("; "),
        };
      }

      return handleSubmit(form.getValues());
    },
  }));

  function handleCloseModal() {
    setOpened(false);
    setStatus("idle");
    form.reset();
  }

  const isLoading = status === "loading";

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title={modalTitle ?? tr.transfer.title}
        size="lg"
        radius="lg"
      >
        {status === "success" ? (
          <>
            <Text ta="center" py="xl">
              {tr.transfer.success}
            </Text>
            <Group justify="center" mt="md">
              <Button onClick={handleCloseModal} radius="xl">
                {tr.transfer.close}
              </Button>
            </Group>
          </>
        ) : (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <input type="hidden" {...form.getInputProps("type")} />
            <Stack gap="sm">
              <TextInput
                label={`${tr.transfer.name} ${tr.transfer.requiredMark}`}
                autoComplete="name"
                aria-required
                disabled={isLoading}
                {...form.getInputProps("name")}
                {...getFieldA11y("name")}
              />
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "1fr 1fr",
                }}
              >
                <TextInput
                  label={`${tr.transfer.email} ${tr.transfer.requiredMark}`}
                  type="email"
                  autoComplete="email"
                  aria-required
                  disabled={isLoading}
                  {...form.getInputProps("email")}
                  {...getFieldA11y("email")}
                />
                <TextInput
                  label={tr.transfer.phone}
                  autoComplete="tel"
                  disabled={isLoading}
                  {...form.getInputProps("phone")}
                  {...getFieldA11y("phone")}
                />
                <TextInput
                  label={`${tr.transfer.pickup} ${tr.transfer.requiredMark}`}
                  placeholder={
                    pickupPlaceholder ?? tr.transfer.pickupPlaceholder
                  }
                  aria-required
                  disabled={isLoading}
                  {...form.getInputProps("pickup")}
                  {...getFieldA11y("pickup")}
                />
                <TextInput
                  label={`${tr.transfer.dropoff} ${tr.transfer.requiredMark}`}
                  placeholder={
                    dropoffPlaceholder ?? tr.transfer.dropoffPlaceholder
                  }
                  aria-required
                  disabled={isLoading}
                  {...form.getInputProps("dropoff")}
                  {...getFieldA11y("dropoff")}
                />
                <DatePickerInput
                  label={tr.transfer.date}
                  locale={lang}
                  minDate={new Date()}
                  maxDate={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() + 1),
                    )
                  }
                  popoverProps={{
                    position: "bottom-start",
                    middlewares: { flip: false, shift: true },
                  }}
                  disabled={isLoading}
                  {...form.getInputProps("date")}
                />
                <TimePicker
                  label={tr.transfer.time}
                  disabled={isLoading}
                  {...form.getInputProps("time")}
                  {...getFieldA11y("time")}
                  format="24h"
                />
                <NumberInput
                  label={tr.transfer.people}
                  min={1}
                  max={20}
                  disabled={isLoading}
                  {...form.getInputProps("people")}
                />
              </div>
              <Textarea
                label={tr.transfer.note}
                rows={3}
                disabled={isLoading}
                {...form.getInputProps("note")}
              />
              {status === "error" && (
                <Text c="red" size="sm">
                  {tr.transfer.error}
                </Text>
              )}
              <div ref={turnstile.containerRef} />
              <Group justify="flex-end" mt="md">
                <Button
                  type="button"
                  variant="default"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  radius="xl"
                >
                  {tr.transfer.cancel}
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading || (turnstile.enabled && !turnstile.token)}
                  radius="xl"
                >
                  {tr.transfer.submit}
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>
    </>
  );
}
