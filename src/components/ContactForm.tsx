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
import { useWebMcpTool } from "../hooks/useWebMcpTool";
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
    return submitFormWithStatus({
      form,
      values,
      setStatus,
      endpoint: "/api/contact-form",
      logLabel: "Contact form",
      toPayload: (currentValues) => toContactFormPayload(currentValues, lang),
    });
  }

  useWebMcpTool({
    name: "send_contact_message",
    description:
      "Send a message to Cambia Paisagem through the contact form on this page, optionally about a specific tour. Fills in and submits the visible contact form.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Full name of the sender." },
        email: {
          type: "string",
          description: "Email address the business should reply to.",
        },
        phone: { type: "string", description: "Optional contact phone number." },
        tour: {
          type: "string",
          description:
            "Optional tour this message relates to. Must be one of the available tour values shown on the page.",
          enum: tours.map((tour) => tour.value),
        },
        message: { type: "string", description: "The message content." },
      },
      required: ["name", "email", "message"],
    },
    annotations: { consequentialHint: true },
    execute: async (input) => {
      const values = {
        name: String(input.name ?? ""),
        email: String(input.email ?? ""),
        phone: input.phone ? String(input.phone) : "",
        tour: input.tour ? String(input.tour) : "",
        message: String(input.message ?? ""),
      };

      form.setValues(values);
      const { hasErrors, errors } = form.validate();
      if (hasErrors) {
        return `Could not send the message, please provide valid values: ${Object.entries(
          errors,
        )
          .map(([field, message]) => `${field}: ${String(message)}`)
          .join("; ")}`;
      }

      const result = await handleSubmit(form.getValues());
      return result.ok
        ? "The message was sent successfully."
        : `Failed to send the message: ${result.error}`;
    },
  });

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
