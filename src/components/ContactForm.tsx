"use client";
import { useState } from "react";
import {
  MantineProvider,
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

const theme = createTheme({
  primaryColor: "dark",
  fontFamily: "Inter, system-ui, sans-serif",
});

interface Props {
  tours: { value: string; label: string }[];
  preselectedTour?: string;
  translations: {
    name: string;
    email: string;
    phone: string;
    tour: string;
    message: string;
    submit: string;
    success: string;
    error: string;
    selectTour: string;
  };
}

function ContactFormInner({ tours, preselectedTour, translations: tr }: Props) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      tour: preselectedTour ?? "",
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
          required
          {...form.getInputProps("name")}
          radius="md"
        />
        <TextInput
          label={tr.email}
          type="email"
          required
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

export default function ContactForm(props: Props) {
  return (
    <MantineProvider theme={theme}>
      <ContactFormInner {...props} />
    </MantineProvider>
  );
}
