"use client";
import { useState } from "react";
import {
  MantineProvider,
  createTheme,
  Modal,
  Button,
  TextInput,
  NumberInput,
  Textarea,
  Stack,
  Group,
  Text,
} from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

const theme = createTheme({
  primaryColor: "dark",
  fontFamily: "Inter, system-ui, sans-serif",
});
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import "dayjs/locale/pt";
import "dayjs/locale/de";

interface Props {
  tourTitle: string;
  tourSlug: string;
  lang: string;
  translations: {
    booking: {
      title: string;
      name: string;
      email: string;
      date: string;
      guests: string;
      notes: string;
      submit: string;
      success: string;
      error: string;
    };
    tours: { book: string };
  };
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
      name: (v) => (!v ? tr.booking.name + " required" : null),
      email: (v) => (!/^\S+@\S+\.\S+$/.test(v) ? "Invalid email" : null),
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
        title={`${tr.booking.title} — ${tourTitle}`}
        size="md"
        radius="md"
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
                required
                {...form.getInputProps("name")}
              />
              <TextInput
                label={tr.booking.email}
                type="email"
                required
                {...form.getInputProps("email")}
              />
              <DatePickerInput
                label={tr.booking.date}
                locale={lang === "de" ? "de" : lang === "en" ? "en" : "pt"}
                minDate={new Date()}
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

export default function BookingModal(props: Props) {
  return (
    <MantineProvider theme={theme}>
      <BookingModalInner {...props} />
    </MantineProvider>
  );
}
