//src/lib/formatters.ts
export const formatRut = (rut: string): string => {
  let cleanedRut = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (cleanedRut.length === 0) return "";
  let formattedRut = "";
  const rutBody = cleanedRut.slice(0, -1);
  const rutDv = cleanedRut.slice(-1);
  if (rutBody.length > 0) {
    let i = rutBody.length - 1;
    let count = 0;
    while (i >= 0) {
      formattedRut = rutBody[i] + formattedRut;
      count++;
      if (count % 3 === 0 && i > 0) {
        formattedRut = "." + formattedRut;
      }
      i--;
    }
  }
  return formattedRut + "-" + rutDv;
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleanedNumber = phoneNumber.replace(/[^0-9+]/g, "");
  if (!cleanedNumber) return "";
  if (cleanedNumber.startsWith("+")) {
    return cleanedNumber;
  }
  return `+56${cleanedNumber}`;
};