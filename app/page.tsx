'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as bip39 from 'bip39'
import * as bip32 from 'bip32'
import { ethers } from 'ethers'
import { Keypair } from '@solana/web3.js'
import { Copy, RefreshCw, ChevronRight, Check, Trash, Eye, EyeOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import nacl from 'tweetnacl'
import * as ed25519 from 'ed25519-hd-key'

export default function CrazyWalletGenerator() {
  const [mnemonic, setMnemonic] = useState('')
  const [addresses, setAddresses] = useState<{ address: string, privateKey: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedWord, setCopiedWord] = useState(-1)
  const [copiedMnemonic, setCopiedMnemonic] = useState(false)
  const [addressCount, setAddressCount] = useState(5)
  const [isMnemonicVisible, setIsMnemonicVisible] = useState(false)
  const [isPrivateKeyVisible, setIsPrivateKeyVisible] = useState(false)

  useEffect(() => {
    generateMnemonic()
  }, [])

  const generateMnemonic =  () => {
    const newMnemonic =  bip39.generateMnemonic()
    setMnemonic(newMnemonic)
    setAddresses([])
  }

  const generateAddresses = async () => {
    setIsLoading(true)
    try {
      const seed = await bip39.mnemonicToSeed(mnemonic)

      const path = `m/44'/501'/${addressCount}'/0'`;
      const derivedSeed = ed25519.derivePath(path, seed.toString("hex")).key
      const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey
      const solanaKeypair = Keypair.fromSecretKey(secret)
      const newSolAddresses = [solanaKeypair.publicKey.toBase58()];

      console.log(newSolAddresses)

      setAddresses(prev => [...prev, { address: newSolAddresses[0], privateKey: solanaKeypair.secretKey.toString() }])
      setAddressCount(prev => prev + 1);
    } catch (error) {
      console.error('Error generating addresses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text, index = -1) => {
    navigator.clipboard.writeText(text)
    if (index !== -1) {
      setCopiedWord(index)
      setTimeout(() => setCopiedWord(-1), 1500)
    } else {
      setCopiedMnemonic(true)
      setTimeout(() => setCopiedMnemonic(false), 1500)
    }
  }

  const deleteAddress = (index: number) => {
    setAddresses(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-black/30 backdrop-blur-xl border-2 border-white/20">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center text-white mb-6">Crazy Wallet Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Button
              onClick={() => setIsMnemonicVisible(!isMnemonicVisible)}
              variant="outline"
              className="w-full text-white bg-black/50 border-white/20 hover:bg-white/10 mb-4"
            >
              {isMnemonicVisible ? 'Hide Mnemonic' : 'Show Mnemonic'}
            </Button>
            {isMnemonicVisible && (
              <motion.div 
                className="relative grid grid-cols-3 sm:grid-cols-4 gap-2 p-4 bg-black/50 rounded-lg"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {mnemonic.split(' ').map((word, index) => (
                  <motion.div
                    key={index}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full h-full min-h-[60px] bg-white/10 hover:bg-white/20 text-white border-white/20"
                      onClick={() => copyToClipboard(word, index)}
                    >
                      {copiedWord === index ? <Check className="w-4 h-4 mr-2" /> : `${index + 1}.`} {word}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
         { isMnemonicVisible && <div className="flex justify-between items-center">
            <Button onClick={generateMnemonic} variant="outline" className="text-white bg-black/50 border-white/20 hover:bg-white/10">
              <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
            </Button>
            <Button onClick={() => copyToClipboard(mnemonic)} variant="outline" className="text-white bg-black/50 border-white/20 hover:bg-white/10">
              {copiedMnemonic ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copiedMnemonic ? 'Copied!' : 'Copy All'}
            </Button>
          </div> }
        
          <Button
            onClick={generateAddresses}
            disabled={isLoading}
            className="w-full py-6 text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white rounded-full shadow-lg"
          >
            {isLoading ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              <>Generate Wallet Addresses <ChevronRight className="w-6 h-6 ml-2" /></>
            )}
          </Button>
        </CardContent>
            <AnimatePresence>
              {addresses.map((address, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20, rotate: -10, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, rotate: 10, scale: 0.8 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                  className="flex items-center justify-between bg-white/5 p-3 rounded-lg"
                >
                  <div className="flex flex-col items-start justify-between w-full p-4 bg-white/10 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-white text-sm font-bold mr-2">Public Key:</span>
                      <span className="text-white text-sm truncate">{address.address}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <span className="text-white text-sm font-bold mr-2">Private Key:</span>
                      <span className="text-white text-sm truncate line-clamp-1 max-w-[250px]">
                        {isPrivateKeyVisible ? address.privateKey : '************'}
                      </span>
                      <Button
                        onClick={() => setIsPrivateKeyVisible(!isPrivateKeyVisible)}
                        variant="ghost"
                        size="sm"
                        className="hover:bg-black/10 ml-2"
                      >
                        {isPrivateKeyVisible ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-white" />}
                      </Button>
                      <Button
                        onClick={() => copyToClipboard(address.privateKey)}
                        variant="ghost"
                        size="sm"
                        className="hover:bg-black/10 ml-2"
                      >
                        <Copy className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                    <div className="flex ml-auto">
                      <Button onClick={() => copyToClipboard(address.address)} variant="ghost" size="sm" className="hover:bg-black/10">
                        <Copy className="w-4 h-4 text-white" />
                      </Button>
                      <Button onClick={() => deleteAddress(index)} variant="ghost" size="sm" className="hover:bg-black/10"> 
                        <Trash className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
      </Card>
    </div>
  )
}