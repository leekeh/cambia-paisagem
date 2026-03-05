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
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

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
        return /^\S+@\S+$/.test(v)
          ? null
          : `${tr.booking.email} ${tr.booking.invalid}`;
      },
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, tour: tourTitle, tourSlug, lang }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

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
        onClose={() => {
          setOpened(false);
          setStatus("idle");
        }}
        title={`${tr.booking.title}: ${tourTitle}`}
        size="md"
        radius="lg"
      >
        {status === "success" ? (
          <Text ta="center" py="xl">
            {tr.booking.success}
          </Text>
        ) : (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="sm">
              <TextInput
                label={tr.booking.name}
                aria-required
                {...form.getInputProps("name")}
              />
              <TextInput
                label={tr.booking.email}
                type="email"
                aria-required
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
                {...form.getInputProps("date")}
              />
              <NumberInput
                label={tr.booking.guests}
                min={1}
                max={20}
                {...form.getInputProps("guests")}
              />
              <Textarea
                label={tr.booking.notes}
                rows={3}
                {...form.getInputProps("notes")}
              />
              {status === "error" && (
                <Text c="red" size="sm">
                  {tr.booking.error}
                </Text>
              )}
              <Group justify="flex-end" mt="md">
                <Button
                  type="submit"
                  loading={status === "loading"}
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
