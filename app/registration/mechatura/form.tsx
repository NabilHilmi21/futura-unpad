"use client"

import { useMemo, useState, type FormEvent } from "react"
import { Check, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

type CompetitionType = "sumo" | "transporter"

type Phase = "competition" | "team" | "robot" | "confirmation" | "payment"

type TeamMember = {
  id: string
  name: string
  studentId: string
  email: string
  phone: string
}

const maxMembers = 3
const maxFileSize = 5 * 1024 * 1024
const minTechnicalDescriptionLength = 40

const phases: Array<{ id: Phase; label: string }> = [
  { id: "competition", label: "Category" },
  { id: "team", label: "Team" },
  { id: "robot", label: "Robot" },
  { id: "confirmation", label: "Review" },
  { id: "payment", label: "Payment" },
]

const competitionOptions: Array<{
  id: CompetitionType
  title: string
  description: string
  prefix: string
}> = [
  {
    id: "sumo",
    title: "Robot Sumo",
    description: "Head-to-head robot battle format. Prepare a durable robot profile for eligibility checks.",
    prefix: "SUMO",
  },
  {
    id: "transporter",
    title: "Robot Transporter",
    description: "Object movement and path execution challenge. Teams should describe the transport mechanism.",
    prefix: "TRANS",
  },
]

const createMember = (): TeamMember => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : String(Date.now()),
  name: "",
  studentId: "",
  email: "",
  phone: "",
})

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

const hasValidPhoneLength = (value: string) =>
  value.replace(/\D/g, "").length >= 9

const formatFileSize = (file: File | null) => {
  if (!file) {
    return "No file selected"
  }

  return `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`
}

export default function MechaturaForm() {
  const [phase, setPhase] = useState<Phase>("competition")
  const [validationRequested, setValidationRequested] = useState<
    Partial<Record<Phase, boolean>>
  >({})
  const [competitionType, setCompetitionType] = useState<CompetitionType | "">("")
  const [teamName, setTeamName] = useState("")
  const [institution, setInstitution] = useState("")
  const [coachName, setCoachName] = useState("")
  const [members, setMembers] = useState<TeamMember[]>([createMember()])
  const [leaderId, setLeaderId] = useState("")
  const [robotName, setRobotName] = useState("")
  const [robotWeight, setRobotWeight] = useState("")
  const [robotDimensions, setRobotDimensions] = useState("")
  const [technicalDescription, setTechnicalDescription] = useState("")
  const [robotPhoto, setRobotPhoto] = useState<File | null>(null)
  const [verificationDocument, setVerificationDocument] = useState<File | null>(null)
  const [agreementAccepted, setAgreementAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const activeLeaderId =
    members.length === 1 ? members[0]?.id ?? "" : leaderId || (members[0]?.id ?? "")
  const activeLeader = members.find((member) => member.id === activeLeaderId)
  const currentPhaseIndex = phases.findIndex((item) => item.id === phase)
  const selectedCompetition = competitionOptions.find(
    (option) => option.id === competitionType
  )
  const teamId = selectedCompetition
    ? `${selectedCompetition.prefix}-2026-001`
    : ""

  const teamErrors = useMemo(() => {
    const memberErrors = members.map((member) => {
      const isLeader = member.id === activeLeaderId

      return {
        name: member.name.trim() ? "" : "Masukkan nama lengkap anggota.",
        studentId: member.studentId.trim()
          ? ""
          : "Masukkan NIM, NISN, atau nomor identitas siswa.",
        email: !isLeader
          ? ""
          : !member.email.trim()
            ? "Masukkan email ketua tim."
            : isValidEmail(member.email)
              ? ""
              : "Gunakan format email yang benar.",
        phone: !isLeader
          ? ""
          : !member.phone.trim()
            ? "Masukkan nomor telepon ketua tim."
            : hasValidPhoneLength(member.phone)
              ? ""
              : "Nomor telepon terlalu pendek.",
      }
    })

    return {
      teamName: teamName.trim() ? "" : "Masukkan nama tim.",
      institution: institution.trim() ? "" : "Masukkan asal institusi.",
      coachName: coachName.trim() ? "" : "Masukkan nama pembina atau pendamping.",
      members: memberErrors,
    }
  }, [activeLeaderId, coachName, institution, members, teamName])

  const teamHasErrors = useMemo(
    () =>
      Boolean(
        teamErrors.teamName ||
          teamErrors.institution ||
          teamErrors.coachName ||
          teamErrors.members.some((member) =>
            Boolean(member.name || member.studentId || member.email || member.phone)
          )
      ),
    [teamErrors]
  )

  const robotErrors = useMemo(
    () => ({
      robotName: robotName.trim() ? "" : "Masukkan nama robot.",
      technicalDescription: !technicalDescription.trim()
        ? "Jelaskan rancangan robot secara singkat."
        : technicalDescription.trim().length < minTechnicalDescriptionLength
          ? `Deskripsi minimal ${minTechnicalDescriptionLength} karakter.`
          : "",
      verificationDocument: !verificationDocument
        ? "Unggah kartu pelajar/mahasiswa atau surat keterangan tim."
        : verificationDocument.size > maxFileSize
          ? "Ukuran file maksimal 5 MB."
          : "",
      robotPhoto:
        robotPhoto && robotPhoto.size > maxFileSize
          ? "Ukuran foto robot maksimal 5 MB."
          : "",
    }),
    [robotName, robotPhoto, technicalDescription, verificationDocument]
  )

  const robotHasErrors = useMemo(
    () => Boolean(Object.values(robotErrors).some(Boolean)),
    [robotErrors]
  )

  const canSubmitReview = !teamHasErrors && !robotHasErrors && agreementAccepted

  const updateMember = (
    id: string,
    field: keyof Omit<TeamMember, "id">,
    value: string
  ) => {
    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    )
  }

  const addMember = () => {
    const nextMember = createMember()
    setMembers((currentMembers) =>
      currentMembers.length >= maxMembers
        ? currentMembers
        : [...currentMembers, nextMember]
    )
  }

  const removeMember = (id: string) => {
    setMembers((currentMembers) => {
      if (currentMembers.length === 1) {
        return currentMembers
      }

      const nextMembers = currentMembers.filter((member) => member.id !== id)

      if (activeLeaderId === id) {
        setLeaderId(nextMembers[0]?.id ?? "")
      }

      return nextMembers
    })
  }

  const requestValidation = (targetPhase: Phase) => {
    setValidationRequested((current) => ({ ...current, [targetPhase]: true }))
  }

  const goToNextPhase = () => {
    if (phase === "competition") {
      if (!competitionType) {
        requestValidation("competition")
        return
      }

      setPhase("team")
      return
    }

    if (phase === "team") {
      if (teamHasErrors) {
        requestValidation("team")
        return
      }

      setPhase("robot")
      return
    }

    if (phase === "robot") {
      if (robotHasErrors) {
        requestValidation("robot")
        return
      }

      setPhase("confirmation")
      return
    }

    if (phase === "confirmation") {
      if (!canSubmitReview) {
        requestValidation("confirmation")
        return
      }

      setPhase("payment")
    }
  }

  const goToPreviousPhase = () => {
    if (phase === "payment") {
      setPhase("confirmation")
      return
    }

    if (phase === "confirmation") {
      setPhase("robot")
      return
    }

    if (phase === "robot") {
      setPhase("team")
      return
    }

    if (phase === "team") {
      setPhase("competition")
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmitReview || !competitionType || !verificationDocument) {
      requestValidation("confirmation")
      setSubmitError("Lengkapi data registrasi sebelum membuka pembayaran.")
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    const payload = new FormData()
    payload.set("competition_type", competitionType)
    payload.set("team_name", teamName)
    payload.set("institution", institution)
    payload.set("coach_name", coachName)
    payload.set("robot_name", robotName)
    payload.set("robot_weight", robotWeight)
    payload.set("robot_dimensions", robotDimensions)
    payload.set("technical_description", technicalDescription)
    payload.set("rules_agreed", String(agreementAccepted))
    payload.set(
      "members",
      JSON.stringify(
        members.map((member) => ({
          full_name: member.name,
          participant_id: member.studentId,
          email: member.id === activeLeaderId ? member.email : "",
          phone: member.id === activeLeaderId ? member.phone : "",
          is_leader: member.id === activeLeaderId,
        }))
      )
    )
    payload.set("verification_document", verificationDocument)

    if (robotPhoto) {
      payload.set("robot_photo", robotPhoto)
    }

    try {
      const res = await fetch("/api/mechatura-registrations", {
        method: "POST",
        body: payload,
      })
      const data = await res.json()

      if (!res.ok || !data.order_id) {
        throw new Error(
          data?.error ?? "Registrasi Mechatura gagal. Silakan coba lagi."
        )
      }

      window.location.href = `/payment?order_id=${encodeURIComponent(data.order_id)}`
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Registrasi Mechatura gagal. Silakan coba lagi."
      )
      setIsSubmitting(false)
    }
  }

  const showCompetitionErrors = validationRequested.competition === true
  const showTeamErrors = validationRequested.team === true
  const showRobotErrors = validationRequested.robot === true
  const showConfirmationErrors = validationRequested.confirmation === true

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <nav aria-label="Registration progress" className="space-y-3">
        <ol className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          {phases.map((item, index) => {
            const stepNumber = index + 1
            const isComplete = index < currentPhaseIndex
            const isReached = index <= currentPhaseIndex

            return (
              <li
                key={item.id}
                className={cn(
                  "flex items-center gap-2",
                  isReached ? "text-foreground" : "text-muted-foreground"
                )}
                aria-current={index === currentPhaseIndex ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium",
                    isReached
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background"
                  )}
                >
                  {isComplete ? <Check className="size-3.5" aria-hidden="true" /> : stepNumber}
                </span>
                <span className="font-medium">{item.label}</span>
              </li>
            )
          })}
        </ol>

        <div
          className="h-2 rounded-full bg-muted"
          role="progressbar"
          aria-label="Registration completion"
          aria-valuemin={1}
          aria-valuemax={phases.length}
          aria-valuenow={currentPhaseIndex + 1}
        >
          <div
            className="h-full rounded-full bg-foreground transition-all"
            style={{ width: `${((currentPhaseIndex + 1) / phases.length) * 100}%` }}
          />
        </div>
      </nav>

      {phase === "competition" ? (
        <FieldGroup className="gap-6">
          <FieldSet>
            <FieldLegend>Competition category</FieldLegend>
            <FieldDescription>
              Choose the track before creating a team. The generated team code
              follows the selected category.
            </FieldDescription>
            <RadioGroup
              value={competitionType}
              onValueChange={(value) => {
                setCompetitionType(value as CompetitionType)
                setValidationRequested((current) => ({
                  ...current,
                  competition: false,
                }))
              }}
              aria-invalid={showCompetitionErrors && !competitionType}
            >
              {competitionOptions.map((option) => (
                <FieldLabel
                  key={option.id}
                  htmlFor={option.id}
                  className="has-[>[data-slot=field]]:rounded-[8px]"
                >
                  <Field orientation="horizontal" className="py-4">
                    <FieldContent>
                      <FieldTitle>{option.title}</FieldTitle>
                      <FieldDescription>{option.description}</FieldDescription>
                    </FieldContent>
                    <RadioGroupItem id={option.id} value={option.id} />
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
            {showCompetitionErrors && !competitionType ? (
              <FieldError>Pilih kategori kompetisi terlebih dahulu.</FieldError>
            ) : null}
          </FieldSet>

          {teamId ? (
            <div className="rounded-[8px] border p-4">
              <p className="text-sm text-muted-foreground">Generated TEAM_ID</p>
              <p className="mt-1 font-mono text-2xl font-semibold">{teamId}</p>
            </div>
          ) : null}

          <Field>
            <Button
              type="button"
              className="h-11 rounded-[8px]"
              onClick={goToNextPhase}
            >
              Create team
            </Button>
          </Field>
        </FieldGroup>
      ) : null}

      {phase === "team" ? (
        <FieldGroup className="gap-6">
          <div className="rounded-[8px] border p-4">
            <p className="text-sm text-muted-foreground">TEAM_ID</p>
            <p className="mt-1 font-mono text-xl font-semibold">
              {teamId || "-"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedCompetition?.title ?? "Robot Competition"}
            </p>
          </div>

          <section className="space-y-4" aria-labelledby="team-section-title">
            <div>
              <h2 id="team-section-title" className="text-lg font-semibold">
                Team information
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Use the official institution and coach data for participant
                verification.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field className="gap-2" data-invalid={showTeamErrors && !!teamErrors.teamName}>
                <FieldLabel htmlFor="team-name">Nama Tim</FieldLabel>
                <Input
                  id="team-name"
                  className="h-11 rounded-[8px]"
                  placeholder="Mecha Robot"
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  aria-invalid={showTeamErrors && !!teamErrors.teamName}
                  required
                />
                {showTeamErrors ? <FieldError>{teamErrors.teamName}</FieldError> : null}
              </Field>

              <Field className="gap-2" data-invalid={showTeamErrors && !!teamErrors.institution}>
                <FieldLabel htmlFor="institution">Asal Institusi</FieldLabel>
                <Input
                  id="institution"
                  className="h-11 rounded-[8px]"
                  placeholder="Universitas Padjadjaran"
                  value={institution}
                  onChange={(event) => setInstitution(event.target.value)}
                  aria-invalid={showTeamErrors && !!teamErrors.institution}
                  required
                />
                {showTeamErrors ? (
                  <FieldError>{teamErrors.institution}</FieldError>
                ) : null}
              </Field>
            </div>

            <Field className="gap-2" data-invalid={showTeamErrors && !!teamErrors.coachName}>
              <FieldLabel htmlFor="coach-name">Nama Pembina</FieldLabel>
              <Input
                id="coach-name"
                className="h-11 rounded-[8px]"
                placeholder="Nama lengkap pembina atau pendamping"
                value={coachName}
                onChange={(event) => setCoachName(event.target.value)}
                aria-invalid={showTeamErrors && !!teamErrors.coachName}
                required
              />
              <FieldDescription>
                Pembina dapat berupa guru, dosen, atau pendamping resmi tim.
              </FieldDescription>
              {showTeamErrors ? <FieldError>{teamErrors.coachName}</FieldError> : null}
            </Field>
          </section>

          <section className="space-y-4 pt-2" aria-labelledby="members-section-title">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 id="members-section-title" className="text-lg font-semibold">
                  Team members
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Maksimal 3 anggota. Ketua tim menjadi kontak utama panitia.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit rounded-[8px]"
                onClick={addMember}
                disabled={members.length >= maxMembers}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {members.length >= maxMembers ? "Maksimal 3" : "Tambah"}
              </Button>
            </div>

            {members.map((member, index) => {
              const isLeader = member.id === activeLeaderId
              const errors = teamErrors.members[index]

              return (
                <FieldSet key={member.id} className="rounded-[8px] border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <FieldLegend className="mb-1 text-sm">
                        Anggota {index + 1}
                      </FieldLegend>
                      <p className="text-xs text-muted-foreground">
                        {isLeader
                          ? members.length === 1
                            ? "Otomatis ketua"
                            : "Ketua tim"
                          : "Anggota"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {members.length > 1 ? (
                        <Button
                          type="button"
                          variant={isLeader ? "default" : "outline"}
                          size="sm"
                          className="rounded-[8px]"
                          onClick={() => setLeaderId(member.id)}
                        >
                          {isLeader ? "Ketua" : "Jadikan ketua"}
                        </Button>
                      ) : null}

                      {members.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-[8px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeMember(member.id)}
                          aria-label={`Hapus anggota ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field className="gap-2" data-invalid={showTeamErrors && !!errors?.name}>
                      <FieldLabel htmlFor={`member-name-${member.id}`}>
                        Nama Lengkap
                      </FieldLabel>
                      <Input
                        id={`member-name-${member.id}`}
                        className="h-11 rounded-[8px]"
                        placeholder="Nama anggota"
                        value={member.name}
                        onChange={(event) =>
                          updateMember(member.id, "name", event.target.value)
                        }
                        aria-invalid={showTeamErrors && !!errors?.name}
                        required
                      />
                      {showTeamErrors ? <FieldError>{errors?.name}</FieldError> : null}
                    </Field>

                    <Field className="gap-2" data-invalid={showTeamErrors && !!errors?.studentId}>
                      <FieldLabel htmlFor={`member-student-id-${member.id}`}>
                        NIM / NISN / ID Peserta
                      </FieldLabel>
                      <Input
                        id={`member-student-id-${member.id}`}
                        className="h-11 rounded-[8px]"
                        placeholder="Nomor identitas"
                        value={member.studentId}
                        onChange={(event) =>
                          updateMember(member.id, "studentId", event.target.value)
                        }
                        aria-invalid={showTeamErrors && !!errors?.studentId}
                        required
                      />
                      {showTeamErrors ? (
                        <FieldError>{errors?.studentId}</FieldError>
                      ) : null}
                    </Field>

                    {isLeader ? (
                      <>
                        <Field className="gap-2" data-invalid={showTeamErrors && !!errors?.email}>
                          <FieldLabel htmlFor={`member-email-${member.id}`}>
                            Email Ketua
                          </FieldLabel>
                          <Input
                            id={`member-email-${member.id}`}
                            type="email"
                            className="h-11 rounded-[8px]"
                            placeholder="ketua@email.com"
                            value={member.email}
                            onChange={(event) =>
                              updateMember(member.id, "email", event.target.value)
                            }
                            aria-invalid={showTeamErrors && !!errors?.email}
                            required
                          />
                          {showTeamErrors ? <FieldError>{errors?.email}</FieldError> : null}
                        </Field>

                        <Field className="gap-2" data-invalid={showTeamErrors && !!errors?.phone}>
                          <FieldLabel htmlFor={`member-phone-${member.id}`}>
                            Nomor Telepon Ketua
                          </FieldLabel>
                          <Input
                            id={`member-phone-${member.id}`}
                            className="h-11 rounded-[8px]"
                            placeholder="+62 8XX-XXXX-XXXX"
                            value={member.phone}
                            onChange={(event) =>
                              updateMember(member.id, "phone", event.target.value)
                            }
                            aria-invalid={showTeamErrors && !!errors?.phone}
                            required
                          />
                          {showTeamErrors ? <FieldError>{errors?.phone}</FieldError> : null}
                        </Field>
                      </>
                    ) : null}
                  </div>
                </FieldSet>
              )
            })}
          </section>

          <Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-[8px]"
                onClick={goToPreviousPhase}
              >
                Back
              </Button>
              <Button
                type="button"
                className="h-11 rounded-[8px]"
                onClick={goToNextPhase}
              >
                Continue
              </Button>
            </div>
          </Field>
        </FieldGroup>
      ) : null}

      {phase === "robot" ? (
        <FieldGroup className="gap-6">
          <section className="space-y-4" aria-labelledby="robot-section-title">
            <div>
              <h2 id="robot-section-title" className="text-lg font-semibold">
                Robot information
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                These details help the committee verify category fit and prepare
                inspection before match day.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field className="gap-2" data-invalid={showRobotErrors && !!robotErrors.robotName}>
                <FieldLabel htmlFor="robot-name">Nama Robot</FieldLabel>
                <Input
                  id="robot-name"
                  className="h-11 rounded-[8px]"
                  placeholder="Atlas Mini"
                  value={robotName}
                  onChange={(event) => setRobotName(event.target.value)}
                  aria-invalid={showRobotErrors && !!robotErrors.robotName}
                  required
                />
                {showRobotErrors ? <FieldError>{robotErrors.robotName}</FieldError> : null}
              </Field>

              <Field className="gap-2">
                <FieldLabel htmlFor="robot-weight">Perkiraan Berat Robot</FieldLabel>
                <Input
                  id="robot-weight"
                  className="h-11 rounded-[8px]"
                  placeholder="Contoh: 2.4 kg"
                  value={robotWeight}
                  onChange={(event) => setRobotWeight(event.target.value)}
                />
                <FieldDescription>Opsional, dapat diperbarui saat inspeksi.</FieldDescription>
              </Field>

              <Field className="gap-2 sm:col-span-2">
                <FieldLabel htmlFor="robot-dimensions">Dimensi Robot</FieldLabel>
                <Input
                  id="robot-dimensions"
                  className="h-11 rounded-[8px]"
                  placeholder="Contoh: 20 x 20 x 15 cm"
                  value={robotDimensions}
                  onChange={(event) => setRobotDimensions(event.target.value)}
                />
                <FieldDescription>Opsional, tulis panjang x lebar x tinggi jika sudah ada.</FieldDescription>
              </Field>

              <Field
                className="gap-2 sm:col-span-2"
                data-invalid={showRobotErrors && !!robotErrors.technicalDescription}
              >
                <FieldLabel htmlFor="technical-description">
                  Deskripsi Teknis Robot
                </FieldLabel>
                <textarea
                  id="technical-description"
                  className={cn(
                    "min-h-32 w-full rounded-[8px] border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
                    showRobotErrors && robotErrors.technicalDescription
                      ? "border-destructive ring-3 ring-destructive/20"
                      : ""
                  )}
                  placeholder={
                    competitionType === "transporter"
                      ? "Jelaskan mekanisme mengambil, membawa, dan menempatkan objek."
                      : "Jelaskan strategi drivetrain, sensor, dan struktur robot sumo."
                  }
                  value={technicalDescription}
                  onChange={(event) => setTechnicalDescription(event.target.value)}
                  aria-invalid={showRobotErrors && !!robotErrors.technicalDescription}
                  required
                />
                <FieldDescription>
                  Minimal {minTechnicalDescriptionLength} karakter. Hindari detail
                  rahasia; cukup jelaskan konsep teknis utama.
                </FieldDescription>
                {showRobotErrors ? (
                  <FieldError>{robotErrors.technicalDescription}</FieldError>
                ) : null}
              </Field>
            </div>
          </section>

          <section className="space-y-4" aria-labelledby="documents-section-title">
            <div>
              <h2 id="documents-section-title" className="text-lg font-semibold">
                Supporting documents
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Uploads are validated in the UI for clarity. Backend storage is
                not connected in this preview.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                className="gap-2"
                data-invalid={showRobotErrors && !!robotErrors.verificationDocument}
              >
                <FieldLabel htmlFor="verification-document">
                  Kartu Pelajar/Mahasiswa atau Surat Keterangan
                </FieldLabel>
                <Input
                  id="verification-document"
                  type="file"
                  className="h-11 rounded-[8px]"
                  accept="image/*,.pdf"
                  onChange={(event) =>
                    setVerificationDocument(event.target.files?.[0] ?? null)
                  }
                  aria-invalid={showRobotErrors && !!robotErrors.verificationDocument}
                  required
                />
                <FieldDescription>{formatFileSize(verificationDocument)}</FieldDescription>
                {showRobotErrors ? (
                  <FieldError>{robotErrors.verificationDocument}</FieldError>
                ) : null}
              </Field>

              <Field className="gap-2" data-invalid={showRobotErrors && !!robotErrors.robotPhoto}>
                <FieldLabel htmlFor="robot-photo">Foto Robot</FieldLabel>
                <Input
                  id="robot-photo"
                  type="file"
                  className="h-11 rounded-[8px]"
                  accept="image/*"
                  onChange={(event) => setRobotPhoto(event.target.files?.[0] ?? null)}
                  aria-invalid={showRobotErrors && !!robotErrors.robotPhoto}
                />
                <FieldDescription>
                  Opsional. {formatFileSize(robotPhoto)}
                </FieldDescription>
                {showRobotErrors ? <FieldError>{robotErrors.robotPhoto}</FieldError> : null}
              </Field>
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-[8px]"
              onClick={goToPreviousPhase}
            >
              Back
            </Button>
            <Button
              type="button"
              className="h-11 rounded-[8px]"
              onClick={goToNextPhase}
            >
              Review registration
            </Button>
          </div>
        </FieldGroup>
      ) : null}

      {phase === "confirmation" ? (
        <FieldGroup className="gap-6">
          <div className="rounded-[8px] border p-4">
            <p className="text-sm text-muted-foreground">TEAM_ID</p>
            <p className="mt-1 font-mono text-2xl font-semibold">
              {teamId || "-"}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {members.length < maxMembers
                ? `Tim masih punya ${maxMembers - members.length} slot. Anggota baru bisa ditambahkan sebelum pembayaran.`
                : "Tim sudah penuh. Tidak ada slot anggota tambahan."}
            </p>
          </div>

          <section className="space-y-4" aria-labelledby="review-section-title">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 id="review-section-title" className="text-lg font-semibold">
                  Review registration
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Cek ulang data sebelum masuk pembayaran. Gunakan tombol edit
                  untuk memperbaiki bagian tertentu.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[8px] border p-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-medium">Team</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-[8px]"
                    onClick={() => setPhase("team")}
                  >
                    Edit
                  </Button>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Competition</dt>
                    <dd className="font-medium">{selectedCompetition?.title ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Nama Tim</dt>
                    <dd className="font-medium">{teamName || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Institusi</dt>
                    <dd className="font-medium">{institution || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Pembina</dt>
                    <dd className="font-medium">{coachName || "-"}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-[8px] border p-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-medium">Members</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-[8px]"
                    onClick={() => setPhase("team")}
                  >
                    Edit
                  </Button>
                </div>
                <div className="mt-4 grid gap-3">
                  {members.map((member) => {
                    const isLeader = member.id === activeLeaderId

                    return (
                      <div
                        key={member.id}
                        className="grid gap-2 rounded-[8px] bg-muted p-3 text-sm sm:grid-cols-3"
                      >
                        <div>
                          <p className="font-medium">{member.name || "-"}</p>
                          <p className="text-xs text-muted-foreground">
                            {isLeader ? "Ketua tim" : "Anggota"}
                          </p>
                        </div>
                        <p className="text-muted-foreground">
                          ID: <span className="text-foreground">{member.studentId || "-"}</span>
                        </p>
                        {isLeader ? (
                          <p className="text-muted-foreground">
                            Kontak:{" "}
                            <span className="text-foreground">
                              {member.email || "-"} / {member.phone || "-"}
                            </span>
                          </p>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-[8px] border p-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-medium">Robot</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-[8px]"
                    onClick={() => setPhase("robot")}
                  >
                    Edit
                  </Button>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Nama Robot</dt>
                    <dd className="font-medium">{robotName || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Berat</dt>
                    <dd className="font-medium">{robotWeight || "Belum diisi"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Dimensi</dt>
                    <dd className="font-medium">{robotDimensions || "Belum diisi"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Dokumen</dt>
                    <dd className="font-medium">
                      {verificationDocument?.name ?? "-"}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">Deskripsi Teknis</dt>
                    <dd className="mt-1 leading-6">{technicalDescription || "-"}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          <Field
            orientation="horizontal"
            className="items-start rounded-[8px] border p-4"
            data-invalid={showConfirmationErrors && !agreementAccepted}
          >
            <Checkbox
              id="agreement"
              checked={agreementAccepted}
              onCheckedChange={(checked) => setAgreementAccepted(checked === true)}
              aria-invalid={showConfirmationErrors && !agreementAccepted}
            />
            <FieldContent>
              <FieldLabel htmlFor="agreement">
                Saya setuju dengan syarat dan ketentuan kompetisi.
              </FieldLabel>
              <FieldDescription>
                Ketua tim menyatakan data sudah benar dan tim bersedia mengikuti
                guidebook, peraturan teknis, jadwal inspeksi, serta keputusan
                panitia.
              </FieldDescription>
              {showConfirmationErrors && !agreementAccepted ? (
                <FieldError>Setujui peraturan kompetisi untuk melanjutkan.</FieldError>
              ) : null}
            </FieldContent>
          </Field>

          {(showConfirmationErrors && (teamHasErrors || robotHasErrors)) ? (
            <FieldError>
              Beberapa data belum lengkap. Periksa kembali bagian Team atau Robot.
            </FieldError>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-[8px]"
              onClick={goToPreviousPhase}
            >
              Back
            </Button>
            <Button
              type="button"
              className="h-11 rounded-[8px]"
              onClick={goToNextPhase}
            >
              Continue to payment
            </Button>
          </div>
        </FieldGroup>
      ) : null}

      {phase === "payment" ? (
        <FieldGroup className="gap-6">
          <div className="rounded-[8px] border p-4">
            <div className="mb-5 rounded-[8px] bg-muted p-3">
              <p className="text-xs text-muted-foreground">TEAM_ID</p>
              <p className="font-mono text-sm font-semibold">{teamId || "-"}</p>
            </div>

            <p className="text-sm text-muted-foreground">Total pembayaran</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">Rp 250.000</p>

            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4 border-t pt-3">
                <dt className="text-muted-foreground">Competition</dt>
                <dd className="font-medium">
                  {selectedCompetition?.title ?? "-"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-3">
                <dt className="text-muted-foreground">Nama Tim</dt>
                <dd className="font-medium">{teamName || "-"}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-3">
                <dt className="text-muted-foreground">Ketua Tim</dt>
                <dd className="font-medium">{activeLeader?.name || "-"}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-3">
                <dt className="text-muted-foreground">Robot</dt>
                <dd className="font-medium">{robotName || "-"}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-3">
                <dt className="text-muted-foreground">Jumlah Anggota</dt>
                <dd className="font-medium">{members.length} orang</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-3">
                <dt className="text-muted-foreground">Payment Status</dt>
                <dd className="font-medium">PENDING_PAYMENT</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-3">
                <dt className="text-muted-foreground">Registration</dt>
                <dd className="font-medium">WAITING_PAYMENT</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[8px] border p-4 text-sm leading-6 text-muted-foreground">
            After this step, your team registration is saved and the payment page
            will create or reopen the secure invoice for this team.
          </div>

          {submitError ? <FieldError>{submitError}</FieldError> : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-[8px]"
              onClick={goToPreviousPhase}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button type="submit" className="h-11 rounded-[8px]" disabled={isSubmitting}>
              {isSubmitting ? "Saving registration..." : "Open payment preview"}
            </Button>
          </div>
        </FieldGroup>
      ) : null}
    </form>
  )
}
