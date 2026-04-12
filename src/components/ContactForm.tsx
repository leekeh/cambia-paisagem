import { useState } from "react";
import {
  TextInput,
  Textarea,
  Select,
  Button,
  Stack,
  Text,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Translations } from "../i18n/pt";
import {
  submitFormWithStatus,
  toContactFormPayload,
  type FormStatus,
  validateEmail,
  validatePhone,
} from "../lib/apiClient";
import MantineProvider from "./MantineProvider";

interface Props {
  tours: { value: string; label: string }[];
  translations: Translations["contact"];
  lang: string;
}

export default function ContactForm(props: Props) {
  return (
    <MantineProvider>
      <ContactFormInner {...props} />
    </MantineProvider>
  );
}

function ContactFormInner({ tours, translations: tr, lang }: Props) {
  const [status, setStatus] = useState<FormStatus>("idle");

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      tour: "",
      message: "",
    },
    validate: {
      name: (v) => (!v ? `${tr.name} ${tr.required}` : null),
      email: (v) => {
        if (!v) return `${tr.email} ${tr.required}`;
        const emailError = validateEmail(v);
        return emailError ? tr.emailInvalid : null;
      },
      phone: (v) => {
        const phoneError = validatePhone(v);
        return phoneError ? tr.phoneInvalid : null;
      },
    },
  });

  const getFieldA11y = (field: keyof typeof form.values) => {
    const message = form.errors[field];
    if (typeof message !== "string" || message.length === 0) {
      return {};
    }

    const errorId = `contact-${String(field)}-error`;
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
      endpoint: "/api/contact-form",
      logLabel: "Contact form",
      toPayload: (currentValues) => toContactFormPayload(currentValues, lang),
    });
  }

  if (status === "success") {
    return (
      <Text c="green" ta="center" py="xl" size="lg">
        {tr.success}
      </Text>
    );
  }

  const isLoading = status === "loading";

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="sm">
        <TextInput
          label={`${tr.name} ${tr.requiredMark}`}
          aria-required
          disabled={isLoading}
          {...form.getInputProps("name")}
          {...getFieldA11y("name")}
          radius="md"
        />
        <TextInput
          label={`${tr.email} ${tr.requiredMark}`}
          type="email"
          aria-required
          disabled={isLoading}
          {...form.getInputProps("email")}
          {...getFieldA11y("email")}
          radius="md"
        />
        <TextInput
          label={tr.phone}
          disabled={isLoading}
          {...form.getInputProps("phone")}
          {...getFieldA11y("phone")}
          radius="md"
        />
        <Select
          label={tr.tour}
          placeholder={tr.selectTour}
          data={tours}
          disabled={isLoading}
          {...form.getInputProps("tour")}
          radius="md"
          clearable
        />
        <Textarea
          label={tr.message}
          rows={4}
          disabled={isLoading}
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
            loading={isLoading}
            disabled={isLoading}
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
