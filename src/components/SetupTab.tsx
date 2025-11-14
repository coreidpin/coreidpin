import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { toast } from 'sonner'
import { api } from '../utils/api'
import { Briefcase, GraduationCap, FileText, CheckCircle, Plus, X } from 'lucide-react'

type SetupData = {
  yearsOfExperience?: string
  currentCompany?: string
  seniority?: string
  topSkills?: string[]
  highestEducation?: string
  resumeFileName?: string
}

const SUGGESTED_COMPANIES = ['Google','Microsoft','Amazon','Meta','Apple','Netflix','OpenAI','Stripe','Shopify','NVIDIA']
const SUGGESTED_SKILLS = ['JavaScript','TypeScript','React','Node.js','Python','Go','Rust','SQL','AWS','Docker','Kubernetes','UI/UX']

export default function SetupTab() {
  const [setupData, setSetupData] = useState<SetupData>({ topSkills: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [completionPercentage, setCompletionPercentage] = useState(0)

  useEffect(() => {
    calculateCompletion()
  }, [setupData])

  const calculateCompletion = () => {
    const fields = [
      setupData.yearsOfExperience,
      setupData.currentCompany,
      setupData.seniority,
      setupData.topSkills?.length ? setupData.topSkills.length >= 3 : false,
      setupData.highestEducation
    ]
    const completed = fields.filter(Boolean).length
    setCompletionPercentage((completed / fields.length) * 100)
  }

  const updateField = (field: keyof SetupData, value: any) => {
    setSetupData(prev => ({ ...prev, [field]: value }))
  }

  const addSkill = (skill: string) => {
    const clean = skill.trim()
    if (!clean) return
    setSetupData(prev => ({ 
      ...prev, 
      topSkills: Array.from(new Set([...(prev.topSkills || []), clean])).slice(0, 20) 
    }))
  }

  const removeSkill = (skill: string) => {
    setSetupData(prev => ({ 
      ...prev, 
      topSkills: (prev.topSkills || []).filter(s => s !== skill) 
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const accessToken = localStorage.getItem('accessToken')
      const userId = localStorage.getItem('userId')
      
      if (!accessToken || !userId) {
        toast.error('Please log in to save your profile')
        return
      }

      await api.updateProfile(userId, accessToken, setupData)
      toast.success('Profile updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Complete Your Profile</h2>
          <p className="text-muted-foreground">Add more details to improve your visibility</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground mb-1">Profile Completion</div>
          <div className="flex items-center gap-2">
            <Progress value={completionPercentage} className="w-24" />
            <span className="text-sm font-medium">{Math.round(completionPercentage)}%</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Professional Details
          </CardTitle>
          <CardDescription>Tell us about your experience and current role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Years of Experience</Label>
              <Select value={setupData.yearsOfExperience || ''} onValueChange={(v) => updateField('yearsOfExperience', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-5">1-5 years</SelectItem>
                  <SelectItem value="5-10">5-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Seniority Level</Label>
              <Select value={setupData.seniority || ''} onValueChange={(v) => updateField('seniority', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entry">Entry Level</SelectItem>
                  <SelectItem value="Mid">Mid Level</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Director">Director</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Current Company</Label>
            <Input 
              placeholder="e.g., Google" 
              value={setupData.currentCompany || ''} 
              onChange={(e) => updateField('currentCompany', e.target.value)} 
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {SUGGESTED_COMPANIES.map((company) => (
                <Badge 
                  key={company} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary/10" 
                  onClick={() => updateField('currentCompany', company)}
                >
                  {company}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Skills & Education
          </CardTitle>
          <CardDescription>Showcase your expertise and qualifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Top Skills (Add at least 3)</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="e.g., React" 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const target = e.target as HTMLInputElement
                    addSkill(target.value)
                    target.value = ''
                  }
                }} 
              />
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  const input = document.querySelector<HTMLInputElement>('input[placeholder="e.g., React"]')
                  if (input) { 
                    addSkill(input.value)
                    input.value = '' 
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {(setupData.topSkills || []).map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <button 
                    type="button" 
                    onClick={() => removeSkill(skill)} 
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {SUGGESTED_SKILLS.map((skill) => (
                <Badge 
                  key={skill} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary/10" 
                  onClick={() => addSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Highest Education</Label>
            <Select value={setupData.highestEducation || ''} onValueChange={(v) => updateField('highestEducation', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High School">High School</SelectItem>
                <SelectItem value="Associate">Associate Degree</SelectItem>
                <SelectItem value="Bachelor">Bachelor's Degree</SelectItem>
                <SelectItem value="Master">Master's Degree</SelectItem>
                <SelectItem value="PhD">PhD</SelectItem>
                <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                <SelectItem value="Self-taught">Self-taught</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Resume (Optional)</Label>
            <Input 
              type="file" 
              accept=".pdf,.doc,.docx" 
              onChange={(e) => {
                const file = e.target.files?.[0]
                updateField('resumeFileName', file?.name || '')
              }} 
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      {completionPercentage === 100 && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Profile Complete!</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Your profile is now complete and optimized for better visibility.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}