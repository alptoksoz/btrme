import { describe, it, expect } from 'vitest'
import { cn, formatNumber, truncate } from '@/lib/utils'

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('text-red-500', 'bg-blue-500')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'active', false && 'inactive')
      expect(result).toContain('base')
      expect(result).toContain('active')
      expect(result).not.toContain('inactive')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1000000)).toBe('1,000,000')
    })
  })

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const text = 'This is a very long string that needs to be truncated'
      expect(truncate(text, 20)).toBe('This is a very long ...')
    })

    it('should not truncate short strings', () => {
      const text = 'Short'
      expect(truncate(text, 20)).toBe('Short')
    })
  })
})
