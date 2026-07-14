import type {
  FieldError as ReactHookFormFieldError,
  FieldErrors,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface FormTextFieldProps<TValues extends FieldValues>
  extends Omit<React.ComponentProps<"input">, "name" | "className" | "required"> {
  name: FieldPath<TValues>;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  fieldClassName?: string;
}

function getFieldError<TValues extends FieldValues>(
  errors: FieldErrors<TValues>,
  name: FieldPath<TValues>
) {
  return String(name)
    .split(".")
    .reduce<unknown>((error, key) => {
      if (error && typeof error === "object") {
        return (error as Record<string, unknown>)[key];
      }

      return undefined;
    }, errors) as ReactHookFormFieldError | undefined;
}

export function FormTextField<TValues extends FieldValues = FieldValues>({
  name,
  label,
  type,
  placeholder,
  autoComplete,
  description,
  className,
  inputClassName,
  disabled,
  required,
  fieldClassName,
  ...props
}: FormTextFieldProps<TValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TValues>();

  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField ? (showPassword ? "text" : "password") : type;

  const error = getFieldError(errors, name);
  const id = String(name);

  const inputElement = (
    <Input
      id={id}
      type={inputType}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className={cn("h-11 rounded-[8px]", isPasswordField && "pr-10", inputClassName)}
      disabled={disabled}
      aria-describedby={error ? `${id}-error` : undefined}
      aria-invalid={!!error}
      {...register(name)}
      {...props}
    />
  );

  return (
    <Field className={cn("gap-2", className, fieldClassName)}>
      <FieldLabel htmlFor={id}>
        {label} {required && <span aria-hidden="true">*</span>}
      </FieldLabel>
      
      {isPasswordField ? (
        <div className="relative">
          {inputElement}
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      ) : (
        inputElement
      )}

      {description && !error ? (
        <p className="text-[0.8rem] text-muted-foreground">{description}</p>
      ) : null}
      {error ? (
        <FieldError id={`${id}-error`}>{String(error.message)}</FieldError>
      ) : null}
    </Field>
  );
}
