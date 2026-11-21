import React, { useRef, useState } from 'react'
import { Camera, Loader2, Upload, Check, AlertCircle, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import accountService from '@/services/accountService'
import { initials } from '@/utils/format'

export default function AvatarUpload({
  size = 'lg',
  variant = 'default',
  onUploaded,
  showHint = false,
  hintText = 'ប្តូររូបថត Profile',
  className = '',
}) {
  const auth = useAuth()
  const toast = useToast()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const fileInputRef = useRef(null)

  const user = auth.user
  const avatarUrl = user?.avatarUrl

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const msg = 'រូបភាពត្រូវតែតូចជាង 5MB'
      setError(msg)
      toast.error(msg)
      return
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      const msg = 'សូមជ្រើសរើសឯកសាររូបភាព (JPG, PNG, WebP)'
      setError(msg)
      toast.error(msg)
      return
    }

    setError(null)
    setSuccessMsg(null)
    setUploading(true)

    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const previewUrl = reader.result
        try {
          const res = await accountService.uploadAvatar(file)
          const updatedUser = res?.data || res
          if (updatedUser && updatedUser.fullName) {
            if (typeof localStorage !== 'undefined' && updatedUser.avatarUrl) {
              localStorage.setItem(`vb_avatar_${updatedUser.id || updatedUser.email}`, updatedUser.avatarUrl)
            }
            auth.setUser(updatedUser)
            if (onUploaded) onUploaded(updatedUser)
          } else {
            const fallbackUser = { ...user, avatarUrl: previewUrl }
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(`vb_avatar_${user?.id || user?.email}`, previewUrl)
            }
            auth.setUser(fallbackUser)
            if (onUploaded) onUploaded(fallbackUser)
          }

          const successText = 'បានផ្លាស់ប្តូររូបភាព Profile ដោយជោគជ័យ!'
          toast.success(successText)
          setSuccessMsg(successText)
          setTimeout(() => setSuccessMsg(null), 4000)
        } catch (uploadErr) {
          console.error('Avatar upload failed:', uploadErr)
          const errorText = uploadErr?.message || 'មិនអាចផ្ទុករូបភាពឡើងបានទេ។ សូមព្យាយាមម្តងទៀត!'
          setError(errorText)
          toast.error(errorText)
          setTimeout(() => setError(null), 4500)
        } finally {
          setUploading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('File reading error:', err)
      const errorText = 'មិនអាចអានឯកសាររូបភាពបានទេ។ សូមព្យាយាមម្តងទៀត។'
      setError(errorText)
      toast.error(errorText)
      setUploading(false)
      setTimeout(() => setError(null), 4500)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const sizeClasses = {
    sm: 'h-11 w-11 text-xs',
    md: 'h-14 w-14 text-sm',
    lg: 'h-20 w-20 text-lg',
    xl: 'h-24 w-24 text-xl sm:h-26 sm:w-26',
  }[size] || 'h-20 w-20 text-lg'

  const badgeSize = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
    xl: 'h-8 w-8',
  }[size] || 'h-7 w-7'

  const iconSize = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5',
    xl: 'h-4 w-4',
  }[size] || 'h-3.5 w-3.5'

  const isBanner = variant === 'banner'

  return (
    <div className={`flex flex-col items-center sm:items-start ${className}`}>
      <div className="relative group cursor-pointer inline-block" onClick={triggerUpload}>
        {/* Avatar Circle */}
        <div
          className={`${sizeClasses} relative rounded-full overflow-hidden border-2 flex items-center justify-center transition-all duration-200 shadow-soft ${
            isBanner
              ? 'border-white bg-white/20 text-white ring-2 ring-white/30 group-hover:ring-white'
              : 'border-white bg-brand-tint text-brand ring-2 ring-line dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 group-hover:ring-brand'
          }`}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user?.fullName || 'Profile'}
              className="h-full w-full object-cover"
            />
          ) : user?.fullName ? (
            <span className="font-bold">
              {initials(user.fullName)}
            </span>
          ) : (
            <UserIcon className="h-1/2 w-1/2 opacity-70" />
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
          </div>
        </div>

        {/* Camera Badge Button */}
        <button
          type="button"
          aria-label="Upload profile photo"
          disabled={uploading}
          className={`absolute bottom-0 right-0 ${badgeSize} rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-md border-2 border-white dark:border-slate-900 focus:outline-none ${
            isBanner
              ? 'bg-white text-brand hover:bg-white/90'
              : 'bg-brand text-white hover:bg-brand/90'
          }`}
        >
          {uploading ? (
            <Loader2 className={`${iconSize} animate-spin`} />
          ) : (
            <Camera className={iconSize} />
          )}
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Status & Hints */}
      <div className="mt-2 text-center sm:text-left">
        {showHint && !uploading && !successMsg && !error && (
          <button
            type="button"
            onClick={triggerUpload}
            className={`text-xs font-semibold hover:underline inline-flex items-center gap-1.5 ${
              isBanner ? 'text-white/90 hover:text-white' : 'text-brand'
            }`}
          >
            <Upload className="h-3 w-3" />
            <span>{hintText}</span>
          </button>
        )}

        {uploading && (
          <p
            className={`text-xs font-medium inline-flex items-center gap-1.5 animate-pulse ${
              isBanner ? 'text-white' : 'text-brand'
            }`}
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>កំពុងផ្ទុករូបភាព...</span>
          </p>
        )}

        {successMsg && (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            <Check className="h-3 w-3" />
            <span>{successMsg}</span>
          </span>
        )}

        {error && (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-xs font-semibold text-rose-600">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </span>
        )}
      </div>
    </div>
  )
}
