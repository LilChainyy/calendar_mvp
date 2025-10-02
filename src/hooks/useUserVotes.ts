import { useState, useEffect } from 'react'

interface UserVote {
  eventId: string
  vote: 'yes' | 'no' | 'no_comment'
}

export function useUserVotes(userId: string | null) {
  const [votes, setVotes] = useState<Map<string, 'yes' | 'no' | 'no_comment'>>(new Map())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return

    const fetchVotes = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/votes')
        if (response.ok) {
          const result = await response.json()
          if (result.success && Array.isArray(result.data)) {
            const voteMap = new Map<string, 'yes' | 'no' | 'no_comment'>()
            result.data.forEach((vote: UserVote) => {
              voteMap.set(vote.eventId, vote.vote)
            })
            setVotes(voteMap)
          }
        }
      } catch (error) {
        console.error('Failed to fetch votes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVotes()
  }, [userId])

  const updateVote = (eventId: string, vote: 'yes' | 'no' | 'no_comment') => {
    setVotes(prev => new Map(prev).set(eventId, vote))
  }

  return { votes, loading, updateVote }
}
