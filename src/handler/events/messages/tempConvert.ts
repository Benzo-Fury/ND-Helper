import { eventModule, EventType } from "@sern/handler";
import { numberPresent } from "../../../functions/numberPresent";
import wordsToNumbers from "words-to-numbers";

type PrimaryMeasurement = "celsius" | "fahrenheit";
type Measurement =
  | PrimaryMeasurement
  | "centigrade"
  | "c"
  | "f"
  | "fah"
  | "cel"
  | "cels";

/**
 * Converts a normal measurement into a primary measurement
 */
function normalizeUnit(text: string) {
  const normalizedUnits: { [key in Measurement]: PrimaryMeasurement } = {
    c: "celsius",
    f: "fahrenheit",
    fah: "fahrenheit",
    cel: "celsius",
    cels: "celsius",
    centigrade: "celsius",
    celsius: "celsius",
    fahrenheit: "fahrenheit",
  };
  return normalizedUnits[text as Measurement] || text;
}

interface ConvertedData {
  temp: number;
  measurement: PrimaryMeasurement;
}

export default eventModule({
  type: EventType.Discord,
  name: "messageCreate",
  execute: async (message) => {
    if (message.author.bot) return;

    let content = message.content.toLowerCase();

    if (!tempMentioned(content)) return;

    // Matching any text numbers and replacing with numerical value
    content = matchNumbers(content);

    // Returning if no numbers are present
    if (!numberPresent(content)) return;

    // Returning if both forms of measurement are detected.
    if (content.includes("celsius") && content.includes("fahrenheit")) return;

    const convertedTemp = convertTemperature(content);

    if (!convertedTemp) return;

    // Replying with the converted temp.
    await message.reply({
      content: `\`${convertedTemp.temp}°${convertedTemp.measurement
        .charAt(0)
        .toUpperCase()}\``,
        allowedMentions: {
           repliedUser: false 
        }
    });
  },
});

/**
 * Uses the text to numbers library to match any text numbers in the content and replace them with their numerical value
 */
function matchNumbers(text: string) {
  const matchedStr = wordsToNumbers(text);

  if (matchedStr) {
    if (typeof matchedStr === "number") {
      return matchedStr.toString();
    } else {
      return matchedStr;
    }
  }

  // The matched string could be null so returning text
  return text;
}

/**
 * Takes a string and checks if a temperature measurement is mentioned
 */
function tempMentioned(text: string) {
  const measurements: Measurement[] = [
    "c",
    "cel",
    "cels",
    "celsius",
    "centigrade",
    "f",
    "fah",
    "fahrenheit",
  ];
  return measurements.some((unit) => text.includes(unit));
}

/**
 * Converts the first found temperature in a given string from Celsius to Fahrenheit or vice versa.
 *
 * @param input A string containing a temperature expression.
 * @returns A string representing the converted temperature.
 */
function convertTemperature(input: string): ConvertedData | null {
  // Regex matches temperature values and measurement units
  const regex =
    /(?:\b(celsius|fahrenheit|centigrade|c|f|fah|cels)\s*(°|degrees|deg)?\s*(-?\d+(\.\d+)?))|(?:(-?\d+(\.\d+)?)\s*(°|degrees|deg)?\s*(celsius|fahrenheit|centigrade|c|f|fah|cels))/i;
  const match = input.match(regex);

  if (match) {
    // Determine if the match was in the "unit before number" form or "number before unit" form
    const value = parseFloat(match[3] || match[5]); // Match[3] for unit-before form, match[5] for number-before form
    const unitRaw = match[1] || match[8]; // Match[1] for unit-before form, match[8] for number-before form

    // Normalize the unit
    const unit = normalizeUnit(unitRaw.toLowerCase());

    // If the unit is "c" or "f", ensure that "degrees", "°", or "deg" is present
    if (
      (unitRaw.toLowerCase() === "c" || unitRaw.toLowerCase() === "f") &&
      !match[2] &&
      !match[7]
    ) {
      // If it's 'c' or 'f' and there's no 'degrees', '°', or 'deg', return null
      return null;
    }

    if (unit === "celsius") {
      const converted = Math.round((value * 9) / 5 + 32);
      return { temp: converted, measurement: "fahrenheit" };
    } else if (unit === "fahrenheit") {
      const converted = Math.round(((value - 32) * 5) / 9);
      return { temp: converted, measurement: "celsius" };
    }
  }
  return null;
}
