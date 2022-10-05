import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { useNotification } from "@web3uikit/core"
import { abi, contractAddresses } from "../constants"
import { useWeb3Contract, useMoralis } from "react-moralis"

export default function LotteryEntrance() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
  const chainId = parseInt(chainIdHex)
  const lotteryAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
  const [entranceFee, setEntranceFee] = useState(0)
  const [numPlayers, setNumPlayers] = useState(0)
  const [recentWinner, setRecentWinner] = useState(0)

  const dispatch = useNotification()

  const {
    runContractFunction: enterLottery,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    // ABI will alaways stay the same
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "enterLottery",
    params: {},
    msgValue: entranceFee,
  })

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "getEntranceFee",
    params: {},
  })

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  })

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "getRecentWinner",
    params: {},
  })

  const updateUI = async () => {
    const entranceFeeFromCall = (await getEntranceFee()).toString()
    const numPlayersFromCall = (await getNumberOfPlayers()).toString()
    const recentWinnerFromCall = await getRecentWinner()
    setEntranceFee(entranceFeeFromCall)
    setNumPlayers(numPlayersFromCall)
    setRecentWinner(recentWinnerFromCall)
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI()
    }
  }, [isWeb3Enabled])

  const handleSuccess = async (tx) => {
    await tx.wait(1)
    handleNewNotification(tx)
    updateUI()
  }

  const handleNewNotification = () => {
    dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Transaction Notification",
      position: "topR",
      icon: "bell",
    })
  }

  const winnerNotification = async () => {}

  return (
    <div className="p-5">
      Welcome to the lottery!
      {lotteryAddress ? (
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bolt py-2 px-4 rounded ml-auto"
            onClick={async function () {
              await enterLottery({
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
              })
            }}
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              <div>Enter Lottery</div>
            )}
          </button>
          <br />
          The entrance fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
          <br />
          Number of players: {numPlayers}
          <br />
          Recent Winner: {recentWinner}
        </div>
      ) : (
        <div>No lottery address detected</div>
      )}
    </div>
  )
}
