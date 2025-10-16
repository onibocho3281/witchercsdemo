import React, { useEffect, useState } from "react";

export default function App() {
  const [sheetUrl, setSheetUrl] = useState(""); // URL of the current sheet
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // URL of your deployed Apps Script web app
  const appsScriptUrl = "https://script.google.com/macros/s/1axxcOuGbVAQ0DfE9--9ceN0sO_9fyczNKckjFUxQIQ8CNGVFnFacGJbT/exec";

  const [name, setName] = useState(""); // character name input
  const [baseStats, setBaseStats] = useState([]);

  // === Function to create a new character sheet ===
  const createNewCharacter = async () => {
    if (!name) {
      alert("Please enter a character name!");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${appsScriptUrl}?name=${encodeURIComponent(name)}`);
      const result = await response.json();
      const newSheetUrl = result.url;
      setSheetUrl(newSheetUrl);
      setData([]); // reset data, will fetch below
    } catch (error) {
      console.error(error);
      alert("Error creating new character sheet");
    } finally {
      setLoading(false);
    }
  };

  // === Fetch sheet data when sheetUrl changes ===
  useEffect(() => {
    if (!sheetUrl) return;

    setLoading(true);
    const fetchSheet = async () => {
      try {
        // Convert the sheet URL to Google Visualization JSON URL
        // sheetId is between /d/ and /edit in the sheet URL
        const sheetId = sheetUrl.match(/\/d\/(.*?)\//)[1];
        const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=General`;

        const res = await fetch(gvizUrl);
        const text = await res.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows.map((r) =>
          r.c.map((cell) => (cell ? cell.v : ""))
        );
        setData(rows);

        // Initialize Base Stats (hard-coded rows for now)
        const baseStatsRows = rows.slice(15, 22);
        setBaseStats(baseStatsRows.map((row) => row[1] || ""));
      } catch (err) {
        console.error(err);
        alert("Error loading character sheet data");
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

  // === Hard-coded sections (row ranges) ===
  const characterInfoRows = data.slice(0, 10);
  const baseStatsRows = data.slice(15, 22);
  const derivedStatsRows = data.slice(22, 35);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🧙 Witcher Character Sheet
      </h1>

      {/* New Character Section */}
      <section className="mb-6 p-4 border rounded shadow bg-white">
        <h2 className="text-xl font-semibold mb-2">Create New Character</h2>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            placeholder="Character Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded p-1 w-40"
          />
          <button
            onClick={createNewCharacter}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            {loading ? "Creating..." : "New Character"}
          </button>
        </div>
      </section>

      {sheetUrl && (
        <>
          {/* Character Info */}
          <section className="mb-6 p-4 border rounded shadow bg-white">
            <h2 className="text-xl font-semibold mb-2">Character Info</h2>
            {renderTable(characterInfoRows)}
          </section>

          {/* Base Stats */}
          <section className="mb-6 p-4 border rounded shadow bg-white">
            <h2 className="text-xl font-semibold mb-2">Base Attributes</h2>
            {renderTable(baseStatsRows, true)}
          </section>

          {/* Derived Stats */}
          <section className="mb-6 p-4 border rounded shadow bg-white">
            <h2 className="text-xl font-semibold mb-2">Derived Stats</h2>
            {renderTable(derivedStatsRows)}
          </section>
        </>
      )}
    </div>
  );
}
