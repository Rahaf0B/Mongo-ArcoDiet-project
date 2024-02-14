function getDate(data: string): string {
  const date = data.split("T")[0];
  return date;
}

function ConstructDateAndTime(data: string): string[] {
  const date = data.split("T")[0];
  const time = data.substring(data.lastIndexOf("T") + 1, data.lastIndexOf("."));
  return [date, time];
}

export default { getDate, ConstructDateAndTime };
