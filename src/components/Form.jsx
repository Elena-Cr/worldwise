/* eslint-disable no-unused-vars */
// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./Form.module.css";
import Button from "./Button";
import ButtonBack from "./ButtonBack";
import Message from "./Message";
import Spinner from "./Spinner";
import { useURLPosition } from "../../hooks/useURLPosition";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}
const flagemojiToPNG = (flag) => {
  // Convert flag emoji to corresponding country code
  const countryCode = [...flag]
    .map((char) =>
      String.fromCharCode(char.codePointAt() - 127397).toLowerCase()
    )
    .join("");
  return (
    <img src={`https://flagcdn.com/24x18/${countryCode}.png`} alt="flag" />
  );
};

const BASE_URL = `https://us1.locationiq.com/v1/reverse`;
const KEY = `pk.7372d9530f30d34d145549fcd5636da4`;

export default function Form() {
  const [cityName, setCityName] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");

  // state variables to implement the reactiveness to the click on map opening the form with the cities details.
  const [lat, lng] = useURLPosition();
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [countryName, setCountryName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [geocodingError, setGeocodingError] = useState("");
  useEffect(() => {
    async function fetchCityData() {
      try {
        setIsLoadingGeocoding(true);
        setGeocodingError("");
        const res = await fetch(
          `${BASE_URL}?key=${KEY}&lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        if (data.error) {
          throw new Error("Thats not a city, click somewhere else");
        }
        const address = data.address;

        setCityName(address.city || address.village || address.town);
        setCountryName(data.address.country);
        setEmoji(convertToEmoji(data.address.country_code));
      } catch (err) {
        setGeocodingError(err.message);
      } finally {
        setIsLoadingGeocoding(false);
      }
    }
    fetchCityData();
  }, [lat, lng]);
  if (isLoadingGeocoding) return <Spinner />;
  if (geocodingError) return <Message message={geocodingError} />;
  return (
    <form className={styles.form}>
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{flagemojiToPNG(emoji)}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <input
          id="date"
          onChange={(e) => setDate(e.target.value)}
          value={date}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <ButtonBack />
      </div>
    </form>
  );
}
