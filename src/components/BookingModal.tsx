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
import MantineProvider from "./MantineProvider";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import "dayjs/locale/pt";
import "dayjs/locale/de";
import type { Translations } from "../i18n/pt";
import {
  submitFormWithStatus,
  toTourBookingPayload,
  type FormStatus,
  validateEmail,
} from "../lib/apiClient";

interface Props {
  tourTitle: string;
  tourSlug: string;
  lang: string;
  translations: {
    booking: Translations["booking"];
    tours: { book: Translations["tours"]["book"] };
  };
}

export default function BookingModal(props: Props) {
  return (
    <MantineProvider>
      <BookingModalInner {...props} />
    </MantineProvider>
  );
}

function BookingModalInner({
  tourTitle,
  tourSlug,
  lang,
  translations: tr,
}: Props) {
  const [opened, setOpened] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      date: null as Date | null,
      guests: 1,
      notes: "",
    },
    validate: {
      name: (v) => (!v ? `${tr.booking.name} ${tr.booking.required}` : null),
      email: (v) => {
        if (!v) return `${tr.booking.email} ${tr.booking.required}`;
        const emailError = validateEmail(v);
        return emailError ? tr.booking.emailInvalid : null;
      },
    },
  });

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
      <Button
        onClick={() => setOpened(true)}
        size="lg"
        radius="xl"
        style={{ minWidth: 180 }}
      >
        {tr.tours.book}
      </Button>

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
              />
              <TextInput
                label={`${tr.booking.email} ${tr.booking.requiredMark}`}
                type="email"
                autoComplete="email"
                aria-required
                disabled={isLoading}
                {...form.getInputProps("email")}
              />
              <DatePickerInput
                label={tr.booking.date}
                locale={lang}
                minDate={new Date()}
                // one year from now
                maxDate={
                  new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                }
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
