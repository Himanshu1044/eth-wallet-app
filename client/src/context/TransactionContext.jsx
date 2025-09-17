import React, { useEffect, useState } from "react";
import { BrowserProvider, Contract, parseEther } from "ethers"; // v6 imports
import { formatEther } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const getEthereumContract = async () => {
    if (!window.ethereum) {
        console.log("Ethereum object not found, install MetaMask");
        return null;
    }

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner(); // ✅ must await
    const transactionContract = new Contract(contractAddress, contractABI, signer);

    return transactionContract;
};

export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [formData, setFormData] = useState({
        addressTo: "",
        amount: "",
        keyword: "",
        message: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(
        localStorage.getItem("transactionCount")
    );
    const [transactions, setTransactions] = useState([])

    const handleChange = (e, name) => {
        setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
    };

    const getAllTransactions = async () => {
        try {
            if (!window.ethereum) return alert("Please install MetaMask");

            const transactionContract = await getEthereumContract();
            const availableTransactions = await transactionContract.getAllTransactions()
            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressFrom: transaction.receiver,
                addressTo: transaction.sender,
                timestamp: new Date(Number(transaction.timestamp) * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: formatEther(transaction.amount), // BigInt → ETH string
            }));

            console.log(availableTransactions);
            setTransactions(structuredTransactions);
        } catch (error) {
            console.log(error);
        }

    }
    const checkIfWalletIsConnected = async () => {
        try {
            if (!window.ethereum) return alert("Please install MetaMask");
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            if (accounts.length) {
                setCurrentAccount(accounts[0]);
                getAllTransactions();
            } else {
                console.log("No accounts found");
            }
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    };

    const checkIfTransactionsExist = async () => {
        try {
            const transactionContract = await getEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();
            window.localStorage.setItem('transactionCount', transactionCount)

        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    }

    const connectWallet = async () => {
        try {
            if (!window.ethereum) return alert("Please install MetaMask");
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.");
        }
    };

    const sendTransaction = async () => {
        try {
            if (!window.ethereum) return alert("Please install MetaMask");

            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = await getEthereumContract();
            if (!transactionContract) return;

            const parsedAmount = parseEther(amount); // ✅ v6 syntax

            // Send ETH transaction
            await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [
                    {
                        from: currentAccount,
                        to: addressTo,
                        gas: "0x5208", // 21000 gwei
                        value: parsedAmount.toString(16), // ✅ hex string
                    },
                ],
            });

            // Call contract method
            const transactionHash = await transactionContract.addToBlockchain(
                addressTo,
                parsedAmount,
                message,
                keyword
            );

            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);

            await transactionHash.wait();

            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();
            setTransactionCount(Number(transactionCount)); // ✅ convert BigInt
            window.reload();
        } catch (err) {
            console.log(err);
            throw new Error("Transaction failed.");
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, []);

    return (
        <TransactionContext.Provider
            value={{
                connectWallet,
                currentAccount,
                formData,
                setFormData,
                handleChange,
                sendTransaction,
                isLoading,
                transactionCount,
                transactions
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};
