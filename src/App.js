import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import { FaLock, FaUnlock, FaInfoCircle } from "react-icons/fa";

const App = () => {
    const [payee, setPayee] = useState("");
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [payeeEditable, setPayeeEditable] = useState(false);
    const [amountEditable, setAmountEditable] = useState(false);
    const [messageEditable, setMessageEditable] = useState(false);
    const [size, setSize] = useState(300);
    const [qrCode, setQrCode] = useState(null);
    const [error, setError] = useState(null);
    const [showPopover, setShowPopover] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!payee.trim()) {
            setError(
                "Mottagare är obligatoriskt. Om du inte anger ett giltigt nummer kommer Swishappen ge ett felmeddelande"
            );
            return;
        }

        const requestBody = {
            format: "jpg",
            payee: payee
                ? { value: payee, editable: payeeEditable }
                : undefined,
            amount: amount
                ? { value: parseFloat(amount), editable: amountEditable }
                : undefined,
            message: message
                ? { value: message, editable: messageEditable }
                : undefined,
            size: size >= 300 ? size : 300,
        };

        try {
            const response = await axios.post(
                "https://swish-qr-dc7e4c886e66.herokuapp.com/api/qrg-swish/api/v1/prefilled",
                requestBody,
                {
                    headers: { "Content-Type": "application/json" },
                    responseType: "arraybuffer",
                }
            );

            const base64Image = btoa(
                new Uint8Array(response.data).reduce(
                    (data, byte) => data + String.fromCharCode(byte),
                    ""
                )
            );

            setQrCode(`data:image/jpeg;base64,${base64Image}`);
            setError(null);
        } catch (err) {
            setError("Misslyckades med att generera QR-kod. Försök igen.");
            console.error(err);
        }
    };

    return (
        <div className="app-container">
            <div className="app-card">
                <div className="header">
                    <h1 className="app-title">Swish-QR-kodgenerator</h1>
                </div>
                <form onSubmit={handleSubmit} className="form-container">
                    {[
                        {
                            label: "Mottagare",
                            state: payee,
                            setState: setPayee,
                            editable: payeeEditable,
                            setEditable: setPayeeEditable,
                            popoverText:
                                "Mottagare måste vara ett giltigt telefonnummer, Swishappen ger fel om det är ditt egna nummer eller ett ogiltigt.",
                        },
                        {
                            label: "Belopp",
                            state: amount,
                            setState: setAmount,
                            editable: amountEditable,
                            setEditable: setAmountEditable,
                        },
                        {
                            label: "Meddelande",
                            state: message,
                            setState: setMessage,
                            editable: messageEditable,
                            setEditable: setMessageEditable,
                        },
                    ].map(
                        ({
                            label,
                            state,
                            setState,
                            editable,
                            setEditable,
                            popoverText,
                        }) => (
                            <div key={label} className="form-group-row">
                                <div className="input-group">
                                    <label>
                                        {label}
                                        {popoverText && (
                                            <div className="info-container">
                                                <button
                                                    className="info-button"
                                                    onClick={(event) => {
                                                        event.preventDefault();
                                                        setShowPopover(
                                                            !showPopover
                                                        );
                                                    }}
                                                >
                                                    <FaInfoCircle />
                                                </button>
                                                <div
                                                    className={`popover ${
                                                        showPopover
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                >
                                                    <p>{popoverText}</p>
                                                </div>
                                            </div>
                                        )}
                                    </label>
                                    <input
                                        type={
                                            label === "Belopp"
                                                ? "number"
                                                : "text"
                                        }
                                        value={state}
                                        onChange={(e) =>
                                            setState(e.target.value)
                                        }
                                        placeholder={`Ange ${label.toLowerCase()}`}
                                    />
                                </div>
                                <div className="checkbox-group">
                                    {editable ? (
                                        <FaUnlock
                                            className="lock-icon"
                                            onClick={() => setEditable(false)}
                                        />
                                    ) : (
                                        <FaLock
                                            className="lock-icon"
                                            onClick={() => setEditable(true)}
                                        />
                                    )}
                                </div>
                            </div>
                        )
                    )}

                    <div className="form-group">
                        <label>Storlek (pixlar)</label>
                        <input
                            type="number"
                            class="size-input"
                            value={size}
                            onChange={(e) => setSize(Number(e.target.value))}
                            min="300"
                            placeholder="Ange storlek (300 eller större)"
                        />
                    </div>

                    <button type="submit" className="submit-button">
                        Generera QR-kod
                    </button>
                </form>

                {qrCode && (
                    <div className="qr-code-container">
                        <h2>Skannas med Swishappen</h2>
                        <img src={qrCode} alt="Genererad QR-kod" />
                    </div>
                )}

                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default App;
