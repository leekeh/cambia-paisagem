import { useState } from "react";
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
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import "dayjs/locale/pt";
import "dayjs/locale/de";
import type { Translations } from "../i18n/pt";
import MantineProvider from "./MantineProvider";
import {
  submitFormWithStatus,
  toTransferPayload,
  type FormStatus,
  validateEmail,
  validatePhone,
} from "../lib/apiClient";

interface Props {
  lang: string;
  translations: {
    transfer: Translations["transfer"];
  };
}

export default function TransferBookingModal(props: Props) {
  return (
    <MantineProvider>
      <TransferBookingModalInner {...props} />
    </MantineProvider>
  );
}

function TransferBookingModalInner({ lang, translations: tr }: Props) {
  const [opened, setOpened] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      phone: "",
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
    },
  });

  function handleSubmit(values: typeof form.values) {
    submitFormWithStatus({
      form,
      values,
      setStatus,
      endpoint: "/api/transfer",
      logLabel: "Transfer booking",
      toPayload: (currentValues) => toTransferPayload(currentValues, lang),
    });
  }

  function handleCloseModal() {
    setOpened(false);
    setStatus("idle");
    form.reset();
  }

  const isLoading = status === "loading";

  return (
    <>
      <Button onClick={() => setOpened(true)} size="lg" radius="xl">
        {tr.transfer.cta}
      </Button>

      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title={tr.transfer.title}
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
            <Stack gap="sm">
              <TextInput
                label={`${tr.transfer.name} ${tr.transfer.requiredMark}`}
                autoComplete="name"
                aria-required
                disabled={isLoading}
                {...form.getInputProps("name")}
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
                />
                <TextInput
                  label={tr.transfer.phone}
                  autoComplete="tel"
                  disabled={isLoading}
                  {...form.getInputProps("phone")}
                />
                <TextInput
                  label={`${tr.transfer.pickup} ${tr.transfer.requiredMark}`}
                  placeholder={tr.transfer.pickupPlaceholder}
                  aria-required
                  disabled={isLoading}
                  {...form.getInputProps("pickup")}
                />
                <TextInput
                  label={`${tr.transfer.dropoff} ${tr.transfer.requiredMark}`}
                  placeholder={tr.transfer.dropoffPlaceholder}
                  aria-required
                  disabled={isLoading}
                  {...form.getInputProps("dropoff")}
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
                  disabled={isLoading}
                  {...form.getInputProps("date")}
                />
                <TextInput
                  label={tr.transfer.time}
                  type="time"
                  disabled={isLoading}
                  {...form.getInputProps("time")}
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
                  disabled={isLoading}
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
