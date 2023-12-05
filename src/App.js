// src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import copy from 'clipboard-copy';
import './App.css';

const App = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [quotes, setQuotes] = useState([]);
  const [jsonValidationMessage, setJsonValidationMessage] = useState('');
  const [statusMessages, setStatusMessages] = useState([]);

  const handleParseJson = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      setQuotes(parsedJson.quoteLineInputs);
      setJsonValidationMessage('');
      setStatusMessages([]);
    } catch (error) {
      console.error('Erro ao analisar o JSON:', error);
      setJsonValidationMessage('Erro ao analisar o JSON. Certifique-se de que está no formato correto.');
      setQuotes([]);
      setStatusMessages([]);
    }
  };

  const handlePrecificar = async (quote, index) => {
    try {
      const response = await axios.post('https://engine-prd.ouroverde.net.br/api/engine/calculateList', {
        quoteLineInputs: [quote],
      });
      if (response.status === 200) {
        setStatusMessages((prevMessages) => [
          ...prevMessages,
          { index, message: 'Precificação realizada com sucesso!' },
        ]);
      } else {
        setStatusMessages((prevMessages) => [
          ...prevMessages,
          { index, message: 'Erro na precificação. Status: ' + response.status },
        ]);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setStatusMessages((prevMessages) => [
        ...prevMessages,
        { index, message: 'Erro na requisição. Verifique o console para mais detalhes.' },
      ]);
    }
  };

  const handleLimpar = () => {
    setJsonInput('');
    setQuotes([]);
    setJsonValidationMessage('');
    setStatusMessages([]);
  };

  const handlePadrao = () => {
    const defaultText = '{ "quoteLineInputs" : [ ] }';
    copy(defaultText);
    alert('Texto padrão copiado para o clipboard.');
  };

  return (
    <div className="container">
      <div className="clear-button" onClick={handleLimpar}>
        X
      </div>
      <button className="default-button" onClick={handlePadrao}>
        Padrão
      </button>
      <textarea
        placeholder="Insira o JSON aqui"
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      />
      <button onClick={handleParseJson}>Analisar JSON</button>
      {jsonValidationMessage && (
        <div className={jsonValidationMessage.includes('sucesso') ? 'success' : 'error'}>
          {jsonValidationMessage}
        </div>
      )}
      <div className="quote-container">
        {quotes.map((quote, index) => (
          <div className="quote-item" key={quote.lineNumber}>
            <p>Linenumber: {quote.lineNumber}</p>
            <button onClick={() => handlePrecificar(quote, index)}>Precificar</button>
            {statusMessages
              .filter((msg) => msg.index === index)
              .map((msg, msgIndex) => (
                <span key={msgIndex} className={msg.message.includes('sucesso') ? 'success' : 'error'}>
                  {msg.message}
                </span>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
