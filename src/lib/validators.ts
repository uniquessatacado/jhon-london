// src/lib/validators.ts

export function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  
  const digits = cpf.split('').map(Number);
  
  const validator = (n: number) => digits.slice(0, n).reduce((sum, digit, index) => sum + digit * (n + 1 - index), 0) % 11;
  
  const d1 = validator(9);
  const dv1 = d1 < 2 ? 0 : 11 - d1;
  if (dv1 !== digits[9]) return false;
  
  const d2 = validator(10);
  const dv2 = d2 < 2 ? 0 : 11 - d2;
  if (dv2 !== digits[10]) return false;
  
  return true;
}

export function validateCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/)) return false;

  const digits = cnpj.split('').map(Number);
  
  const validator = (slice: number[]) => {
    let weight = 2;
    const sum = slice.reduceRight((acc, digit) => {
      const result = acc + digit * weight;
      weight = weight === 9 ? 2 : weight + 1;
      return result;
    }, 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  if (validator(digits.slice(0, 12)) !== digits[12]) return false;
  if (validator(digits.slice(0, 13)) !== digits[13]) return false;

  return true;
}