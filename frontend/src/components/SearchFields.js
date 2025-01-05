import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import "./SearchFields.css";

const SearchFieldsComponent = () => {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://127.0.0.1:8000/api/fields/")
      .then((response) => {
        // Mapiraj podatke sa backend-a na format za react-select
        const formattedOptions = response.data.map((field) => ({
          value: field.id,
          label: `${field.location} - ${field.precise_location}`,
        }));
        setOptions(formattedOptions);
      })
      .catch((error) => {
        console.error("Greška prilikom dohvatanja lokacija:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleFieldClick = (selected) => {
    if (selected) {
      window.location.replace(`/teren-profil/${selected.value}`);
    }
  };

  return (
    <div className="searchContainer">
      <Select
        options={options}
        isLoading={loading}
        onChange={handleFieldClick}
        placeholder="Pretraga terena..."
        className="react-select-container"
        classNamePrefix="react-select"
        noOptionsMessage={() => "Nema rezultata"}
        isClearable
      />
    </div>
  );
};

export default SearchFieldsComponent;
