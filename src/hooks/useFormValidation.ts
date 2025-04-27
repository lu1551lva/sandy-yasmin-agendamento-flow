
import { useState } from 'react';
import { validatePhone, validateEmail } from '@/lib/phoneUtils';

type ValidationErrors = Record<string, string>;

interface UseFormValidationProps {
  initialValues?: Record<string, any>;
}

export function useFormValidation({ initialValues = {} }: UseFormValidationProps = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
    validateField(name, values[name]);
  };

  const validateField = (name: string, value: any): boolean => {
    let error = '';

    switch (name) {
      case 'email':
        if (!value) {
          error = 'Email é obrigatório';
        } else if (!validateEmail(value)) {
          error = 'Email inválido';
        }
        break;
      case 'phone':
      case 'telefone':
        if (!value) {
          error = 'Telefone é obrigatório';
        } else if (!validatePhone(value)) {
          error = 'Telefone inválido, formato: (XX) XXXXX-XXXX';
        }
        break;
      case 'password':
      case 'senha':
        if (!value) {
          error = 'Senha é obrigatória';
        } else if (value.length < 6) {
          error = 'Senha deve ter no mínimo 6 caracteres';
        }
        break;
      case 'confirmPassword':
        if (value !== values.password) {
          error = 'As senhas não coincidem';
        }
        break;
      default:
        if (value === '' || value === null || value === undefined) {
          error = `${name} é obrigatório`;
        }
    }

    setErrors({
      ...errors,
      [name]: error,
    });

    return !error;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(values).forEach(name => {
      if (!validateField(name, values[name])) {
        isValid = false;
        newErrors[name] = errors[name] || `${name} inválido`;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setValues,
    setErrors,
  };
}
