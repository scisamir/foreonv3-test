"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { MarketFormData } from "@/lib/types"
import Image from "next/image"
import BackButton from "./BackButton"

export function ProposeMarketForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<MarketFormData>({
    coverImage: "",
    marketTitle: "",
    category: "",
    startTime: "",
    endTime: "",
    marketSummary: "",
    marketType: "single",
    resolveMethod: "oracle",
    email: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    const existingResponses = localStorage.getItem("marketProposals")
    const responsesArray = existingResponses ? JSON.parse(existingResponses) : []

    responsesArray.push({ ...formData, submittedAt: new Date().toISOString() })
    localStorage.setItem("marketProposals", JSON.stringify(responsesArray))

    setFormData({
      coverImage: "",
      marketTitle: "",
      category: "",
      startTime: "",
      endTime: "",
      marketSummary: "",
      marketType: "single",
      resolveMethod: "oracle",
      email: "",
    })

    console.log("Submitting market proposal:", formData)
    router.push("/proposed-market")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setFormData({ ...formData, coverImage: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Purple Gradient */}
      <div className="hidden lg:flex lg:w-2/5 relative bg-transparent h-auto m-0 p-0">
        <Image
          src="/propose-market.png"
          alt="propose-market"
          fill
          className="object-contain object-top"
          priority
        />
      </div>


      {/* Right Panel - Form */}
      <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <BackButton />

            <h2 className="text-2xl font-bold mb-2">Market Details</h2>
            <p className="text-[#00000080]">Provide your market details below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Cover Image */}
            <div className="mb-2">
              <Label htmlFor="cover-image" className="text-base font-medium">
                Cover Image
              </Label>
              <div className="flex align-middle justify-center items-center gap-4 mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer relative">
                <Upload className="w-8 h-8 text-[#00000080]" />
                <p className="text-base mb-1 text-[#00000080]">
                  Drag and drop files here or <span className="
                    inline-block 
                    rounded-md 
                    text-transparent 
                    bg-clip-text 
                    bg-gradient-to-r from-[#00A9B7] via-[#4C32F2] to-[#9F00BE]
                  ">Choose file</span>
                </p>
                <input
                  type="file"
                  id="cover-image"
                  accept="image/png, image/jpeg"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                {formData.coverImage && (
                  <img src={formData.coverImage} alt="Preview" className="mt-2 w-48 h-48 object-cover rounded-lg" />
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm text-[#00000080]"><span>Files supported: JPEG, PNG</span><span>Max size: 2MB</span></div>

            {/* Market Title */}
            <div>
              <Label htmlFor="market-title" className="text-base font-medium">
                Market Title
              </Label>
              <Input
                id="market-title"
                placeholder="Enter title"
                className="mt-2 h-15 pl-6 placeholder:text-[#00000080] placeholder:text-base border border-[#E6E1E6] rounded-[8px]"
                value={formData.marketTitle}
                onChange={(e) => setFormData({ ...formData, marketTitle: e.target.value })}
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-base font-medium">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-2 w-full px-6 h-15 placeholder:text-[#00000080] placeholder:text-base border border-[#E6E1E6] rounded-[8px]">
                  <SelectValue placeholder="Choose category" className="text-[#00000080]" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="politics">Politics</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="pop-culture">Pop Culture</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Market Trading Time */}
            <div>
                <Label className="text-base font-medium">Market Trading Time</Label>
                
                {/* Combined Input Container */}
                <div className="
                    mt-2
                    flex
                    items-center
                    h-15
                    px-6
                    w-full
                    border border-[#E6E1E6] rounded-[8px]
                    relative
                ">
                    
                    {/* Start Time Input (Visual Only - type="text") */}
                    <input
                        placeholder="Start time"
                        // Set type to 'text' to ensure the placeholder is visible and no native picker appears
                        type="text" 
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="
                            flex-grow 
                            bg-transparent 
                            outline-none 
                            border-none 
                            placeholder:text-[#00000080]
                            text-base 
                            px-0
                        "
                    />

                    {/* Separator */}
                    <div className="w-px h-6 bg-gray-200 mx-4 shrink-0"></div> 

                    {/* End Time Input (Visual Only - type="text") */}
                    <input
                        placeholder="End time"
                        // Set type to 'text' to ensure the placeholder is visible and no native picker appears
                        type="text" 
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="
                            flex-grow 
                            bg-transparent 
                            outline-none 
                            border-none 
                            placeholder:text-[#00000080]
                            text-base 
                            px-0
                        "
                    />
                    
                    {/* Calendar Icon */}
                    <Calendar className="w-5 h-5 text-gray-500 ml-4 shrink-0" />
                </div>
            </div>
            {/* <div>
              <Label className="text-base font-medium">Market Trading Time</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Input
                    placeholder="Start time"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <Input
                    placeholder="End time"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div> */}

            {/* Market Summary */}
            <div>
              <Label htmlFor="market-summary" className="text-base font-medium">
                Market Summary
              </Label>
              <Textarea
                id="market-summary"
                placeholder="Describe your market"
                className="mt-2 w-full px-6 pt-4 min-h-30 placeholder:text-[#00000080] border border-[#E6E1E6] rounded-[8px] placeholder:text-base"
                value={formData.marketSummary}
                onChange={(e) => setFormData({ ...formData, marketSummary: e.target.value })}
              />
            </div>

            {/* Market Condition */}
            <div>
              <Label className="text-2xl font-medium mb-4 block text-[#22005D]">Market Condition</Label>
              <p className="text-sm text-[#00000080] mb-4">Provide your market conditions to proceed</p>

              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-medium">Market type</Label>
                  {/* <RadioGroup
                    value={formData.marketType}
                    onValueChange={(value) => setFormData({ ...formData, marketType: value })}
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single-outcome" />
                      <Label htmlFor="single-outcome" className="text-sm">
                        Single outcome
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multiple" id="multiple-outcomes" />
                      <Label htmlFor="multiple-outcomes" className="text-sm">
                        Multiple outcomes
                      </Label>
                    </div>
                  </RadioGroup> */}
                  <RadioGroup value={formData.marketType} onValueChange={(v) => setFormData({ ...formData, marketType: v })} className="flex gap-6 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single-outcome" />
                      <Label htmlFor="single-outcome" className="text-sm text-[#55617E]">Single outcome</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multiple" id="multiple-outcomes" />
                      <Label htmlFor="multiple-outcomes" className="text-sm text-[#55617E]">Multiple outcomes</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-lg font-medium">Resolve method</Label>
                  <RadioGroup
                    value={formData.resolveMethod}
                    onValueChange={(value) => setFormData({ ...formData, resolveMethod: value })}
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="oracle" id="oracle-auto" />
                      <Label htmlFor="oracle-auto" className="text-sm text-[#55617E]">
                        Oracle Automatically
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="manual" />
                      <Label htmlFor="manual" className="text-sm text-[#55617E]">
                        Manually
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <Label htmlFor="email" className="text-base font-medium">
                Your Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                className="mt-2 w-full pl-6 h-15 placeholder:text-[#00000080] placeholder:text-base border border-[#E6E1E6] rounded-[8px]"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <Button type="button" variant="outline" className="flex-1 h-15 rounded-4xl bg-gradient-to-r px-[2.5px] py-0.5 from-[#00A9B7] via-[#4C32F2] to-[#9F00BE]" onClick={() => router.back()}>
                <span className="flex h-full w-full bg-white rounded-4xl px-5 py-2 justify-center items-center hover:bg-transparent hover:text-white transition-all text-lg">
                  Cancel
                </span>
              </Button>
              <Button
                type="submit"
                className="flex-2 bg-primary hover:bg-primary/90 h-15 rounded-4xl text-lg"
                style={{
                  background: "linear-gradient(135deg, #00A9B7 -1.33%, #4C32F2 47.36%, #9F00BE 95.53%)",
                }}
              >
                Propose Market
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
