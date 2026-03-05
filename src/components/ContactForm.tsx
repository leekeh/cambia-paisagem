import { useState } from "react";
import {
  createTheme,
  TextInput,
  Textarea,
  Select,
  Button,
  Stack,
  Text,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import "@mantine/core/styles.css";
import type { Translations } from "../i18n/pt";
import MantineProvider from "./MantineProvider";

interface Props {
  tours: { value: string; label: string }[];
  translations: Translations["contact"];
}

export default function ContactForm(props: Props) {
  return (
    <MantineProvider>
      <ContactFormInner {...props} />
    </MantineProvider>
  );
}

function ContactFormInner({ tours, translations: tr }: Props) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      tour: "",
      message: "",
    },
    validate: {
      name: (v) => (!v ? `${tr.name} required` : null),
      email: (v) => (!/^\S+@\S+\.\S+$/.test(v) ? "Invalid email" : null),
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <Text c="green" ta="center" py="xl" size="lg">
        {tr.success}
      </Text>
    );
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="sm">
        <TextInput
          label={tr.name}
          aria-required
          {...form.getInputProps("name")}
          radius="md"
        />
        <TextInput
          label={tr.email}
          type="email"
          aria-required
          {...form.getInputProps("email")}
          radius="md"
        />
        <TextInput
          label={tr.phone}
          {...form.getInputProps("phone")}
          radius="md"
        />
        <Select
          label={tr.tour}
          placeholder={tr.selectTour}
          data={tours}
          {...form.getInputProps("tour")}
          radius="md"
          clearable
        />
        <Textarea
          label={tr.message}
          rows={4}
          {...form.getInputProps("message")}
          radius="md"
        />
        {status === "error" && (
          <Text c="red" size="sm">
            {tr.error}
          </Text>
        )}
        <Group justify="flex-end" mt="md">
          <Button
            type="submit"
            loading={status === "loading"}
            radius="xl"
            size="md"
          >
            {tr.submit}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
