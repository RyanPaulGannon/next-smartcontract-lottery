import { ConnectButton } from "@web3uikit/web3"

import React from "react"

export default function Header() {
  return (
    <div>
      <ConnectButton moralisAuth={false} />
    </div>
  )
}
