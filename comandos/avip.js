// conversion.js

module.exports = {
  name: "avip",
  async execute(client, message, args) {
    // Verifica si se proporcionó un monto válido
    const amountStr = args[0];
    const amount = parseFloat(amountStr.replace(".", "").replace(",", ".")); // Remueve los puntos y reemplaza la coma con un punto para el análisis

    if (isNaN(amount)) {
      return message.reply("Debes proporcionar un monto válido en dólares.");
    }

    // Realiza la conversión
    const conversionRate = 50000;
    const convertedAmount = amount * conversionRate;

    // Formatea el resultado con el punto de separación de miles
    const formattedAmount = convertedAmount.toLocaleString();

    // Crea un RegExp para insertar el punto de separación de miles
    const regex = /\B(?=(\d{3})+(?!\d))/g;
    const formattedResponse = formattedAmount.replace(regex, ".");

    // Envía el resultado al usuario con el punto de separación de miles
    message.reply(`${amountStr}$ equivale a ${formattedResponse} de precio de auto.`);
    message.delete()
  }
};
