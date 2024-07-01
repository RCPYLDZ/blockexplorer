import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState, useCallback } from 'react';
import TextArea from 'devextreme-react/text-area';
import DataGrid, {
  Grouping,
  GroupPanel,
  Pager,
  Paging,
  SearchPanel,
  Selection,
  MasterDetail
} from 'devextreme-react/data-grid';
import TextBox, { TextBoxTypes } from 'devextreme-react/text-box';
import 'devextreme/dist/css/dx.material.teal.dark.compact.css';
import './App.css';

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

const pageSizes = [10, 25, 50, 100];

const columns = ['hash', 'blockNumber', 'from', 'to', 'nonce', 'chainId'];

function App() {
  // DARK OR LIGHT MODE AUTO SET
  const isDark = window.matchMedia("(prefers-color-scheme:dark)").matches

  const lightTheme = {
    backgroundColor : "white",
    color : "black"
  }

  const darkTheme = {
    backgroundColor : "black",
    color : "white"
  }
  // DARK OR LIGHT MODE AUTO SET

  const [blockNumber, setBlockNumber] = useState();
  const [blockTransactions, setBlockTransactions] = useState([]);
  const [transactionSelected, setTransactionSelected] = useState('');

  useEffect(async () => {
    document.title = 'Block Explorer';
    async function getBlockNumber() {
      setBlockNumber(await alchemy.core.getBlockNumber());
    }
    if(!blockNumber){
      await getBlockNumber();
    }
  });

  useEffect(async () => {
    async function setTransactions() {
      try {
        const { transactions } = await alchemy.core.getBlockWithTransactions(blockNumber)
        setBlockTransactions(transactions);
      } catch (error) {
        setBlockTransactions([]);
      }
    }

    await setTransactions();
  },[blockNumber]);

  const onBlockNumberChanged = useCallback((data: TextBoxTypes.ValueChangedEvent) => {
    setBlockNumber(parseInt(`${data.value}`));
  }, []);

  const onContentReady = (e) => {
    if (!e.component.getSelectedRowKeys().length) {
      e.component.selectRowsByIndexes([0]);
    }
  };

  const onSelectionChanged = useCallback(({ selectedRowsData }) => {
    const data = selectedRowsData[0];
    //console.log("Data");
    console.log(data);
    //const singleTransaction = Array.from(data);
    if (typeof data != "undefined"){
      //console.log(Object.getOwnPropertyNames(singleTransaction));
      console.log("hash = ", data.hash);

      setTransactionSelected(data)
    }
  }, {});

  const Block = () => {
    return (
        <>
          <div style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 24,
            fontSize: 24,
          }}>
            <b>Block Explorer</b>
          </div>
          <div style={{display: "flex", justifyContent: "center", marginTop: 24}}>
            <TextBox
                style={{width: '10%', height: '100%'}}
                placeholder="Enter blocknumber here..."
                onValueChanged={onBlockNumberChanged}
            />
          </div>
          <div className="App">Selected Block Number: {blockNumber}</div>
        </>
    );
  }

  const Transactions = () => {
    return (
        <DataGrid
            dataSource={blockTransactions}
            defaultColumns={columns}
            showBorders={true}
            width="100%"
            hoverStateEnabled={true}
            onSelectionChanged={onSelectionChanged}
        >
          <GroupPanel visible={true} />
          <Selection mode="single" />
          <SearchPanel
              visible={true}
              highlightCaseSensitive={true}
          />
          <Grouping autoExpandAll={false} />
          <Pager
              allowedPageSizes={pageSizes}
              showPageSizeSelector={true}
          />
          <Paging defaultPageSize={10} />
          { <MasterDetail
              enabled={true}
              component={JsonDetailTransaction}
          />}
        </DataGrid>
    );
  }

  const JsonDetailTransaction = () => {
    return (
        <TextArea
            height={180}
            label="Transaction Details"
            labelMode="outside"
            stylingMode='outlined'
            value={JSON.stringify(transactionSelected, undefined, 4)}
        />
    );
  }

  return (
      <div style={isDark?darkTheme:lightTheme}>
      <>
        <Block />
        <Transactions />
      </>
      </div>
  );
}

export default App;
