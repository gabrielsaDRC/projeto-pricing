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
  const [categoria, setCategoria] = useState('leves'); 

  
  const [quoteNumber, setQuoteNumber] = useState('');
  const [quotesPesados, setQuotesPesados] = useState([]);
  const [reviewQuotes, setReviewQuote] = useState([]);

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

  const handleQuoteJson = async (quote) => {
    var url = 'https://ouropricing-prd.unidas.com.br/api/price/review-heavy/quotationLines?quote=' + quote;

    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        setQuotesPesados(response.data.data);
      } else {
        setQuotesPesados([]);
        alert('Erro ao buscar dados da cotação. Verifique a saída do console.')
      }
    } catch (error) {
      console.error('Erro ao obter o cotação:', error);
      alert('Erro ao buscar dados da cotação. Certifique-se de a cotação existe.');
      setQuotesPesados([]);
    }
  }

  const handlePrecificar = async (quote, index) => {
    try {
      const response = await axios.post('https://engine-prd.unidas.com.br/api/engine/calculateList', {
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

  const handleReviewQuote = async (id) => {
    var url = 'https://ouropricing-prd.unidas.com.br/api/price/review-heavy/' + id;

    try {
      debugger
      const response = await axios.get(url);
      if (response.status === 200) {
        setReviewQuote(response.data.data);
        return response.data.data;
      } else {
        setReviewQuote([]);
        alert('Erro ao buscar dados da revisão. Verifique a saída do console.')
      }
    } catch (error) {
      console.error('Erro ao obter o cotação:', error);
      alert('Erro ao buscar dados da revisão. Certifique-se de a cotação existe.');
      setReviewQuote([]);
    }
  }

  const handleExtrair = async(selectedQuote, index) => {
    var quoteLines = [];
    debugger
    var reviewQuote = await handleReviewQuote(selectedQuote.priceEngineReview.id)
    debugger;
    var quoteLine = JSON.parse(reviewQuote.input);
    var result = JSON.parse(reviewQuote.result);
    
    result.InvestimentTotal = result.AccesoriesInvestment + result.MobilizationInvestment + result.EquipmentInvestment;
    reviewQuote.investimentTotal = result.InvestimentTotal;
    
    if (quoteLine.InsuranceFranchise < 0)
    {
      alert("A Linha de Cotação não possui valor definido para Franquia Seguro!");
    }
    
    quoteLine.HasPrecification = true;
    quoteLine.MethodCalculate = selectedQuote?.priceEngineInput?.methodCalculate;
    quoteLine.SpreadValor = selectedQuote?.priceEngineInput?.spreadValor;
    quoteLine.SourceApplication = quoteLine.SpreadValor <= 0 ? 1 : 2;

    quoteLine.SalesDaysTerm = selectedQuote?.priceEngineInput.salesDaysTerm;
    quoteLine.InsuranceAmount = selectedQuote?.priceEngineInput.insuranceAmount;
    quoteLine.VehicleInsuranceAmount = selectedQuote?.priceEngineInput.vehicleInsuranceAmount;
    quoteLine.ResponsabilityInsurance = selectedQuote?.priceEngineInput.responsabilityInsurance;
    quoteLine.InsuranceFranchise = selectedQuote?.priceEngineInput.insuranceFranchise;
    quoteLine.PercentRisk = selectedQuote?.priceEngineInput.percentRisk;
    quoteLine.AliqISS = selectedQuote?.priceEngineInput.aliqISS;
    quoteLine.DataInicioSafra = selectedQuote?.priceEngineInput.dataInicioSafra;
    quoteLine.RentalAmount = selectedQuote?.priceEngineResult.rentalAmount;

    
    quoteLine.OldStatus = quoteLine.OldStatus == null || quoteLine.OldStatus == '' ? reviewQuote.previousStatus : quoteLine.OldStatus;
    quoteLines.push(quoteLine)

    quoteLines.map((line) => {
      const body = {
        Gatilho: 11,
        QuoteLineInputs: [line],
      };

      copy(JSON.stringify(body));
      alert('Gatilho copiado para o clipboard.');
    });    
    
  }

  const handleLimpar = () => {
    setJsonInput('');
    setQuotes([]);
    setJsonValidationMessage('');
    setStatusMessages([]);
    setQuotesPesados([]);
    setQuoteNumber('');
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
      <select onChange={(e) => setCategoria(e.target.value)}>
        <option value="leves">Leves</option>
        <option value="pesados">Pesados</option>
      </select>
      {categoria === 'leves' ? (
      <><textarea
          placeholder="Insira o JSON aqui"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)} /><button onClick={handleParseJson}>Analisar JSON</button></>
      ) : null}
      {categoria === 'pesados' ? (
      <><textarea
          placeholder="Insira a Cotação aqui"
          value={quoteNumber}
          onChange={(e) => setQuoteNumber(e.target.value)} /><button onClick={() => handleQuoteJson(quoteNumber)}>Extrair Cotação</button></>
      ) : null}
      {jsonValidationMessage && (
        <div className={jsonValidationMessage.includes('sucesso') ? 'success' : 'error'}>
          {jsonValidationMessage}
        </div>
      )}
      <div className="quote-container-leves">
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
      <div className="quote-container-pesados">
        {quotesPesados.map((quote, index) => (
          <div className="quote-item" key={quote.priceEngineReview.lineNumber}>
            <p>Linenumber: {quote.priceEngineReview.lineNumber}</p>
            <button onClick={() => handleExtrair(quote, index)}>Copiar JSON</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
