'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export interface QuestionnaireData {
  sectors: string[]
  investmentTimeline: string
  checkFrequency: string
  riskTolerance: string
  portfolioStrategy: string
}

const SECTORS = [
  'Technology',
  'Financial Services',
  'Healthcare',
  'Energy',
  'Consumer Goods',
  'Automotive',
  'Cryptocurrency',
  'Industrials',
  'Communication Services',
  'All sectors / Not sure yet',
]

const CHECK_FREQUENCIES = [
  { value: 'multiple_daily', label: 'Multiple times per day' },
  { value: 'daily', label: 'Once daily' },
  { value: 'few_weekly', label: 'Few times per week' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly / rarely' },
]

const PORTFOLIO_STRATEGIES = [
  {
    value: 'celebrity',
    label: 'Follow a celebrity/influencer portfolio',
    description: 'Get recommendations based on popular investor picks and trending stocks',
  },
  {
    value: 'diy',
    label: 'Build from scratch based on my interests',
    description: 'Get personalized recommendations based on your sector preferences',
  },
  {
    value: 'mix',
    label: 'Mix of both',
    description: 'Combine trending stocks with personalized recommendations',
  },
]

export default function OnboardingQuestionnaire() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<QuestionnaireData>({
    sectors: [],
    investmentTimeline: '3',
    checkFrequency: '',
    riskTolerance: '3',
    portfolioStrategy: '',
  })

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canProceed()) {
        e.preventDefault()
        if (currentStep < totalSteps) {
          handleNext()
        } else {
          handleSubmit()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleSkip()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentStep, formData])

  const totalSteps = 5

  const handleSectorToggle = (sector: string) => {
    setFormData((prev) => {
      const isSelected = prev.sectors.includes(sector)
      let newSectors: string[]

      if (sector === 'All sectors / Not sure yet') {
        // If "All sectors" is selected, clear other selections
        newSectors = isSelected ? [] : [sector]
      } else {
        // Remove "All sectors" if selecting specific sector
        const filtered = prev.sectors.filter((s) => s !== 'All sectors / Not sure yet')
        if (isSelected) {
          newSectors = filtered.filter((s) => s !== sector)
        } else {
          // Limit to 3 selections
          if (filtered.length >= 3) {
            return prev
          }
          newSectors = [...filtered, sector]
        }
      }

      return { ...prev, sectors: newSectors }
    })
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.sectors.length > 0
      case 2:
        return true // Slider always has a value
      case 3:
        return formData.checkFrequency !== ''
      case 4:
        return true // Slider always has a value
      case 5:
        return formData.portfolioStrategy !== ''
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSkip = () => {
    router.push('/calendar')
  }

  const handleSubmit = async () => {
    if (!canProceed()) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Save preferences to database
      const response = await fetch('/api/onboarding/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      // Redirect to recommendations page
      router.push('/onboarding/recommendations')
    } catch (err) {
      setError('Failed to save your preferences. Please try again.')
      setIsSubmitting(false)
    }
  }

  const renderQuestion = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Which sectors interest you most?
              </h2>
              <p className="text-gray-600">Select 1-3 sectors (or choose "All sectors")</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SECTORS.map((sector) => {
                const isSelected = formData.sectors.includes(sector)
                const isAllSectors = sector === 'All sectors / Not sure yet'
                const isDisabled =
                  !isSelected &&
                  !isAllSectors &&
                  formData.sectors.length >= 3 &&
                  !formData.sectors.includes('All sectors / Not sure yet')

                return (
                  <button
                    key={sector}
                    onClick={() => handleSectorToggle(sector)}
                    disabled={isDisabled}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                        : isDisabled
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{sector}</span>
                      {isSelected && (
                        <svg
                          className="w-5 h-5 text-indigo-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                What's your investment timeline?
              </h2>
              <p className="text-gray-600">How long do you typically hold investments?</p>
            </div>
            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.investmentTimeline}
                onChange={(e) =>
                  setFormData({ ...formData, investmentTimeline: e.target.value })
                }
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span className={formData.investmentTimeline === '1' ? 'font-semibold text-indigo-600' : ''}>
                  Day trading
                </span>
                <span className={formData.investmentTimeline === '2' ? 'font-semibold text-indigo-600' : ''}>
                  Short term
                </span>
                <span className={formData.investmentTimeline === '3' ? 'font-semibold text-indigo-600' : ''}>
                  Medium term
                </span>
                <span className={formData.investmentTimeline === '4' ? 'font-semibold text-indigo-600' : ''}>
                  Long term
                </span>
                <span className={formData.investmentTimeline === '5' ? 'font-semibold text-indigo-600' : ''}>
                  Buy & hold
                </span>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-900">
                  {formData.investmentTimeline === '1' && 'Very short term (days) - High activity trading'}
                  {formData.investmentTimeline === '2' && 'Short term (weeks) - Active trading with quick gains'}
                  {formData.investmentTimeline === '3' && 'Medium term (months to a year) - Balanced approach'}
                  {formData.investmentTimeline === '4' && 'Long term (1-3 years) - Growth investing'}
                  {formData.investmentTimeline === '5' && 'Buy and hold (3+ years) - Long-term wealth building'}
                </p>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                How often do you check your portfolio?
              </h2>
              <p className="text-gray-600">This helps us tailor notifications and updates</p>
            </div>
            <div className="space-y-3">
              {CHECK_FREQUENCIES.map((freq) => (
                <button
                  key={freq.value}
                  onClick={() => setFormData({ ...formData, checkFrequency: freq.value })}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    formData.checkFrequency === freq.value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{freq.label}</span>
                    {formData.checkFrequency === freq.value && (
                      <svg
                        className="w-5 h-5 text-indigo-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                What's your risk tolerance?
              </h2>
              <p className="text-gray-600">How comfortable are you with market volatility?</p>
            </div>
            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.riskTolerance}
                onChange={(e) => setFormData({ ...formData, riskTolerance: e.target.value })}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span className={formData.riskTolerance === '1' ? 'font-semibold text-indigo-600' : ''}>
                  Very conservative
                </span>
                <span className={formData.riskTolerance === '2' ? 'font-semibold text-indigo-600' : ''}>
                  Conservative
                </span>
                <span className={formData.riskTolerance === '3' ? 'font-semibold text-indigo-600' : ''}>
                  Moderate
                </span>
                <span className={formData.riskTolerance === '4' ? 'font-semibold text-indigo-600' : ''}>
                  Growth
                </span>
                <span className={formData.riskTolerance === '5' ? 'font-semibold text-indigo-600' : ''}>
                  Aggressive
                </span>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-900">
                  {formData.riskTolerance === '1' && 'Very conservative - Prefer stable, dividend-paying stocks'}
                  {formData.riskTolerance === '2' && 'Conservative - Prefer low volatility and steady growth'}
                  {formData.riskTolerance === '3' && 'Moderate - Balanced mix of growth and stability'}
                  {formData.riskTolerance === '4' && 'Growth-oriented - Higher volatility for potential gains'}
                  {formData.riskTolerance === '5' && 'Aggressive - High growth, speculative investments'}
                </p>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                How do you want to build your portfolio?
              </h2>
              <p className="text-gray-600">Choose your preferred approach</p>
            </div>
            <div className="space-y-3">
              {PORTFOLIO_STRATEGIES.map((strategy) => (
                <button
                  key={strategy.value}
                  onClick={() =>
                    setFormData({ ...formData, portfolioStrategy: strategy.value })
                  }
                  className={`w-full p-5 rounded-lg border-2 text-left transition-all ${
                    formData.portfolioStrategy === strategy.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 bg-white hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div
                        className={`font-semibold mb-1 ${
                          formData.portfolioStrategy === strategy.value
                            ? 'text-indigo-900'
                            : 'text-gray-900'
                        }`}
                      >
                        {strategy.label}
                      </div>
                      <p
                        className={`text-sm ${
                          formData.portfolioStrategy === strategy.value
                            ? 'text-indigo-700'
                            : 'text-gray-600'
                        }`}
                      >
                        {strategy.description}
                      </p>
                    </div>
                    {formData.portfolioStrategy === strategy.value && (
                      <svg
                        className="w-6 h-6 text-indigo-600 flex-shrink-0 ml-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentStep} of {totalSteps}
            </span>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip for now
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {renderQuestion()}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Back
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                canProceed()
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                canProceed() && !isSubmitting
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'See Recommendations'}
            </button>
          )}
        </div>

        {/* Keyboard Hint */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Enter</kbd> to continue
        </div>
      </div>
    </div>
  )
}
