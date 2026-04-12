import { useEffect, useState } from "react";
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
import "@mantine/dates/styles.css";
import { useForm } from "@mantine/form";
import "dayjs/locale/pt";
import "dayjs/locale/de";
import type { Translations } from "../i18n/pt";
import MantineProvider from "./MantineProvider";
import {
  submitFormWithStatus,
  toTourBookingPayload,
  type FormStatus,
  validateEmail,
  validatePhone,
} from "../lib/apiClient";

interface Props {
  tourTitle: string;
  tourSlug: string;
  lang: string;
  openSignal?: number;
  onReady?: () => void;
  translations: {
    booking: Translations["booking"];
    tours: { book: Translations["tours"]["book"] };
  };
}

export default function BookingModalInner(props: Props) {
  return (
    <MantineProvider>
      <BookingModalInnerContent {...props} />
    </MantineProvider>
  );
}

function BookingModalInnerContent({
  tourTitle,
  tourSlug,
  lang,
  translations: tr,
  openSignal = 0,
  onReady,
}: Props) {
  const [opened, setOpened] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");

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
      date: null as Date | null,
      guests: 1,
      notes: "",
    },
    validate: {
      name: (v) => (!v ? `${tr.booking.name} ${tr.booking.required}` : null),
      email: (v) => {
        if (!v) return `${tr.booking.email} ${tr.booking.required}`;
        const emailError = validateEmail(v);
        return emailError ? `${tr.booking.email} ${tr.booking.invalid}` : null;
      },
      phone: (v) => {
        const phoneError = validatePhone(v);
        return phoneError ? `${tr.booking.phone} ${tr.booking.invalid}` : null;
      },
    },
  });

  const getFieldA11y = (field: keyof typeof form.values) => {
    const message = form.errors[field];
    if (typeof message !== "string" || message.length === 0) {
      return {};
    }

    const errorId = `booking-${String(field)}-error`;
    return {
      error: <span id={errorId}>{message}</span>,
      "aria-invalid": true,
      "aria-describedby": errorId,
    };
  };

  function handleSubmit(values: typeof form.values) {
    submitFormWithStatus({
      form,
      values,
      setStatus,
      endpoint: "/api/tour-booking",
      logLabel: "Tour booking",
      toPayload: (currentValues) =>
        toTourBookingPayload(currentValues, {
          tour: tourTitle,
          tourSlug,
          lang,
        }),
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
      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title={`${tr.booking.title}: ${tourTitle}`}
        size="md"
        radius="lg"
      >
        {status === "success" ? (
          <>
            <Text ta="center" py="xl">
              {tr.booking.success}
            </Text>
            <Group justify="center" mt="md">
              <Button onClick={handleCloseModal} radius="xl">
                {tr.booking.close}
              </Button>
            </Group>
          </>
        ) : (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="sm">
              <TextInput
                label={`${tr.booking.name} ${tr.booking.requiredMark}`}
                autoComplete="name"
                aria-required
                disabled={isLoading}
                {...form.getInputProps("name")}
                {...getFieldA11y("name")}
              />
              <TextInput
                label={`${tr.booking.email} ${tr.booking.requiredMark}`}
                type="email"
                autoComplete="email"
                aria-required
                disabled={isLoading}
                {...form.getInputProps("email")}
                {...getFieldA11y("email")}
              />
              <TextInput
                label={tr.booking.phone}
                autoComplete="tel"
                disabled={isLoading}
                {...form.getInputProps("phone")}
                {...getFieldA11y("phone")}
              />
              <DatePickerInput
                label={tr.booking.date}
                locale={lang}
                minDate={new Date()}
                maxDate={
                  new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                }
                popoverProps={{
                  position: "bottom-start",
                  middlewares: { flip: false, shift: true },
                }}
                disabled={isLoading}
                {...form.getInputProps("date")}
              />
              <NumberInput
                label={tr.booking.guests}
                min={1}
                max={20}
                disabled={isLoading}
                {...form.getInputProps("guests")}
              />
              <Textarea
                label={tr.booking.notes}
                rows={3}
                disabled={isLoading}
                {...form.getInputProps("notes")}
              />
              {status === "error" && (
                <Text c="red" size="sm">
                  {tr.booking.error}
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
                  {tr.booking.cancel}
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading}
                  radius="xl"
                >
                  {tr.booking.submit}
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>
    </>
  );
}
