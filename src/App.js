import React, { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const sheetUrl =
    "https://docs.google.com/spreadsheets/d/1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ/gviz/tq?tqx=out:json&sheet=General";

  useEffect(() => {
    fetch(sheetUrl)
      .then((res) => res.text())
      .then((text) => {
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows.map((r) =>
          r.c.map((cell) => (cell ? cell.v : ""))
        );
        setData(rows);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4 text-center">Loading sheet data...</p>;

  // === Sections (hard-coded) ===
  const characterInfoRows = data.slice(0, 10);
  const baseStatsRows = data.slice(15, 22);
  const derivedStatsRows = data.slice(22, 35);

  // Editable fields mapping
  const [name, setName] = useState(characterInfoRows[0]?.[1] || "");
  const [baseStats, setBaseStats] = useState(
    baseStatsRows.map((row) => row[1] || "")
  );

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
                      value={baseStats[i]}
                      onChange={(e) =>
                        handleBaseStatChange(i, e.target.value)
                      }
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

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🧙 Witcher Character Sheet
      </h1>

      <section className="mb-6 p-4 border rounded shadow bg-white">
        <h2 className="text-xl font-semibold mb-2">Character Info</h2>
        <div className="mb-2">
          <label className="mr-2 font-semibold">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded p-1 w-40"
          />
        </div>
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
    </div>
  );
}
