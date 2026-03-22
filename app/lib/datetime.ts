type DateStyle = "short" | "long";

type DateFormatState = {
  locale: string;
  style: DateStyle;
  includeDay: boolean;
};

const DEFAULT_STATE: DateFormatState = {
  locale: "pt-BR",
  style: "short",
  includeDay: true,
};

function toDate(input: string | Date): Date {
  if (input instanceof Date) return input;

  const monthMatch = /^(\d{4})-(\d{2})$/.exec(input);
  if (monthMatch) {
    const year = Number(monthMatch[1]);
    const month = Number(monthMatch[2]);
    return new Date(year, month - 1, 1, 12, 0, 0, 0);
  }

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (dateMatch) {
    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  return new Date(input);
}

function toIntlOptions(state: DateFormatState): Intl.DateTimeFormatOptions {
  if (!state.includeDay) {
    if (state.style === "long") {
      return {
        month: "long",
        year: "numeric",
      };
    }

    return {
      month: "2-digit",
      year: "numeric",
    };
  }

  if (state.style === "long") {
    return {
      day: "2-digit",
      month: "long",
      year: "numeric",
    };
  }

  return {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
}

function createBuilder(input: string | Date, state: DateFormatState) {
  const next = (patch: Partial<DateFormatState>) =>
    createBuilder(input, { ...state, ...patch });

  return {
    long() {
      return next({ style: "long" });
    },
    short() {
      return next({ style: "short" });
    },
    withoutDay() {
      return next({ includeDay: false });
    },
    withDay() {
      return next({ includeDay: true });
    },
    locale(locale: string) {
      return next({ locale });
    },
    build() {
      const date = toDate(input);
      if (Number.isNaN(date.getTime())) {
        return input instanceof Date ? input.toString() : String(input);
      }
      return date.toLocaleDateString(state.locale, toIntlOptions(state));
    },
  };
}

export function dateFormatter(input: string | Date) {
  return createBuilder(input, DEFAULT_STATE);
}

type FormatDateOptions = {
  format?: "long";
  exclude?: "day"[];
};

export function formatDate(date: string, opts?: FormatDateOptions): string {
  let builder = dateFormatter(date);

  if (opts?.format === "long") {
    builder = builder.long();
  }

  if (opts?.exclude?.includes("day")) {
    builder = builder.withoutDay();
  }

  return builder.build();
}
