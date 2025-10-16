import React, { useEffect, useState } from "react";

export default function App() {
  const [sheetUrl, setSheetUrl] = useState(""); // User's copy URL
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [baseStats, setBaseStats] = useState([]);
  const [characterName, setCharacterName] = useState(""); // auto-populated from sheet

  const templateUrl = "https://script.google.com/macros/s/AKfycbwoe733X8bTNza44s00GGXD8dOXgSVkr_07wA2qD5p1/dev";

  // Fetch sheet data when URL changes
  useEffect(() => {
    if (!sheetUrl) return;
    setLoading(true);

    const fetchSheet = async () => {
      try {
        const sheetId = sheetUrl.match(/\/d\/(.*?)\//)[1];
        const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=General`;

        const res = await fetch(gvizUrl);
        const text = await res.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows.map((r) =>
          r.c.map((cell) => (cell ? cell.v : ""))
        );

        setData(rows);

        // Assume character name is in cell A1 (row 0, column 0)
        setCharacterName(rows[0][0] || "");

        const baseStatsRows = rows.slice(15, 22);
        setBaseStats(baseStatsRows.map((row) => row[1] || ""));
      } catch (err) {
        console.error(err);
        alert("Error loading your character sheet. Make sure your sheet is shared properly.");
      } finally {
        setLoading(false);
      }
    };

    fetchSheet();
  }, [sheetUrl]);

  const handleBaseStatChange = (index, value) => {
    const updated = [...baseStats];
    updated[index] = value;
    setBaseStats(updated);
  };

  const renderTable = (rows, editable = false) => (
    <table className="border border-gray-300 w-full text-sm">
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => {
              if (editable && j === 1) {
                return (
                  <td key={j} className="border border-gray-300 p-1">
                    <input
                      type="number"
                      value={baseStats[i] || ""}
                      onChange={(e) => handleBaseStatChange(i, e.target.value)}
                      className="w-16 text-center border rounded p-1"
                    />
                  </td>
                );
              } else {
                return (
                  <td key={j} className="border border-gray-300 p-1">
                    {cell}
                  </td>
                );
              }
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const characterInfoRows = data.slice(0, 10);
  const baseStatsRows = data.slice(15, 22);
  const derivedStatsRows = data.slice(22, 35);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🧙 Witcher Character Sheet
      </h1>

      <section className="mb-6 p-4 border rounded shadow bg-white">
        <h2 className="text-xl font-semibold mb-2">Create New Character</h2>
        <p className="mb-2">
          1. Click the button below to open the template sheet.
        </p>
        <p className="mb-2">
          2. In Google Sheets, go to <strong>File → Make a copy</strong> and save it in your Drive.
        </p>
        <p className="mb-2">
          3. Paste the URL of your copy below to load it in this app.
        </p>
        <button
          onClick={() => window.open(templateUrl, "_blank")}
          className="bg-blue-600 text-white px-3 py-1 rounded mb-2"
        >
          Open Template Sheet
        </button>
        <input
          type="text"
          placeholder="Paste your sheet URL here"
          value={sheetUrl}
          onChange={(e) => setSheetUrl(e.target.value)}
          className="border rounded p-1 w-full mb-2"
        />
        {characterName && (
          <p>
            <strong>Character Name:</strong> {characterName}
          </p>
        )}
      </section>

      {sheetUrl && (
        <>
          <section className="mb-6 p-4 border rounded shadow bg-white">
            <h2 className="text-xl font-semibold mb-2">Character Info</h2>
            {renderTable(characterInfoRows)}
          </section>

          <section className="mb-6 p-4 border rounded shadow bg-white">
            <h2 className="text-xl font-semibold mb-2">Base Attributes</h2>
            {renderTable(baseStatsRows, true)}
          </section>

          <section className="mb-6 p-4 border rounded shadow bg-white">
            <h2 className="text-xl font-semibold mb-2">Derived Stats</h2>
            {renderTable(derivedStatsRows)}
          </section>
        </>
      )}
    </div>
  );
}
