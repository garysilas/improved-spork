// Adapted from Gary's selected shadcn.io ai-chat-with-tools registry block.
// https://www.shadcn.io/blocks/ai-chat-with-tools
// Retains its header, plain message rows, tool cards, JSON details, and composer.
import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowLeftIcon,
  ArrowUpIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CopyIcon,
  FileSearchIcon,
  FileTextIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { ChatReview, ReviewTool } from '@/services/chat-review'

function CopyContent({
  text,
  label,
}: {
  readonly text: string
  readonly label: string
}) {
  const [status, setStatus] = useState('')
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('Copied')
    } catch (error) {
      if (import.meta.env.DEV)
        console.error('Could not copy sample content', error)
      setStatus('Could not copy. Select the text to copy it manually.')
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="ghost"
        className="min-h-11 sm:min-h-8"
        onClick={() => void copy()}
      >
        <CopyIcon data-icon="inline-start" aria-hidden="true" />
        {label}
      </Button>
      <span role="status" className="text-xs text-muted-foreground">
        {status}
      </span>
    </div>
  )
}

function ToolCallCard({
  tool,
  index,
}: {
  readonly tool: ReviewTool
  readonly index: number
}) {
  const [expanded, setExpanded] = useState(false)
  const reducedMotion = useReducedMotion()
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="overflow-hidden rounded-md border"
    >
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto min-h-12 w-full justify-start gap-3 rounded-none px-3 py-3"
          >
            <FileSearchIcon aria-hidden="true" />
            <span className="min-w-0 flex-1 whitespace-normal text-start">
              {tool.displayName}
            </span>
            <span className="sr-only">Completed</span>
            <CheckCircle2Icon aria-hidden="true" />
            <ChevronDownIcon
              aria-hidden="true"
              className={cn(
                'transition-transform motion-reduce:transition-none',
                expanded && 'rotate-180',
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-3 border-t bg-muted/20 px-3 py-3">
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-medium text-muted-foreground">
                Input
              </h3>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded bg-muted/50 p-3 font-mono text-xs leading-relaxed">
                {JSON.stringify(tool.input, null, 2)}
              </pre>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Output
                </h3>
                <CopyContent
                  text={JSON.stringify(tool.output, null, 2)}
                  label={`Copy ${tool.name} output`}
                />
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded bg-muted/50 p-3 font-mono text-xs leading-relaxed">
                {JSON.stringify(tool.output, null, 2)}
              </pre>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  )
}

function PlanInspector({ data }: { readonly data: ChatReview }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="min-h-11">
          <FileTextIcon data-icon="inline-start" aria-hidden="true" />
          View plan
        </Button>
      </SheetTrigger>
      <SheetContent
        className="data-[side=right]:w-full data-[side=right]:sm:max-w-xl"
        showCloseButton={false}
      >
        <SheetHeader>
          <SheetTitle>{data.artifact.title}</SheetTitle>
          <SheetDescription>
            Markdown · Version {data.version.version} · Fabricated sample
            content
          </SheetDescription>
          <SheetClose asChild>
            <Button variant="ghost" className="mt-3 min-h-11 self-start">
              <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
              Back to conversation
            </Button>
          </SheetClose>
        </SheetHeader>
        <Separator />
        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">
            <code>{data.version.content}</code>
          </pre>
        </div>
        <SheetFooter>
          <CopyContent text={data.version.content} label="Copy Markdown" />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default function AiChatWithTools({
  data,
}: {
  readonly data: ChatReview
}) {
  const [input, setInput] = useState('')
  const [activityOpen, setActivityOpen] = useState(false)
  const userMessages = data.messages.filter(
    (message) => message.author === 'user',
  )
  const assistantMessages = data.messages.filter(
    (message) => message.author === 'assistant',
  )
  return (
    <section
      aria-labelledby="review-title"
      className="mx-auto flex w-full max-w-4xl flex-1 flex-col p-3 sm:p-6"
    >
      <div className="flex flex-col overflow-hidden rounded-lg border bg-card">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div className="flex flex-col gap-1">
            <h1 id="review-title" className="text-base font-medium">
              {data.task.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              Chat with tools · Sample task
            </p>
          </div>
          <Badge variant="secondary">
            <CheckCircle2Icon aria-hidden="true" />
            Completed
          </Badge>
        </header>
        <div>
          {userMessages.map((message) => (
            <div
              key={message.id}
              className="flex flex-col gap-2 border-b px-5 py-5 sm:px-6"
            >
              <h2 className="text-xs font-medium text-muted-foreground">You</h2>
              <p className="whitespace-pre-wrap text-base leading-relaxed sm:text-sm">
                {message.text}
              </p>
            </div>
          ))}
          <Collapsible
            open={activityOpen}
            onOpenChange={setActivityOpen}
            className="border-b px-5 py-3 sm:px-6"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto min-h-11 w-full justify-start gap-2 px-2 py-3"
              >
                <CheckCircle2Icon aria-hidden="true" />
                <span className="min-w-0 flex-1 whitespace-normal text-start">
                  Completed {data.tools.length} tool actions
                </span>
                <span className="hidden sm:inline">
                  {activityOpen ? 'Hide activity' : 'Show activity'}
                </span>
                <ChevronDownIcon
                  aria-hidden="true"
                  className={cn(
                    'transition-transform motion-reduce:transition-none',
                    activityOpen && 'rotate-180',
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col gap-2 pb-3 pt-2">
                {data.tools.map((tool, index) => (
                  <ToolCallCard key={tool.id} tool={tool} index={index} />
                ))}
                <p className="px-2 pt-2 text-xs text-muted-foreground">
                  {data.tools.length} of {data.tools.length} completed ·
                  Simulated activity
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
          <div className="flex flex-col items-start gap-4 px-5 py-5 sm:px-6">
            {assistantMessages.map((message) => (
              <div key={message.id} className="flex flex-col gap-2">
                <h2 className="text-xs font-medium text-muted-foreground">
                  Assistant
                </h2>
                <p className="whitespace-pre-wrap text-base leading-relaxed sm:text-sm">
                  {message.text}
                </p>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-3">
              <PlanInspector data={data} />
              <span className="text-xs text-muted-foreground">
                {data.artifact.title} · Markdown
              </span>
            </div>
          </div>
        </div>
        <div className="border-t px-5 py-4 sm:px-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="review-draft">Draft a follow-up</FieldLabel>
              <Textarea
                id="review-draft"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="What would you like to change?"
                rows={3}
                aria-describedby="draft-help"
              />
              <div className="flex items-center justify-between gap-3">
                <FieldDescription id="draft-help">
                  No agent connected. Your draft stays here until you leave or
                  reload.
                </FieldDescription>
                <Button
                  disabled
                  size="icon-lg"
                  aria-label="Send unavailable: no agent connected"
                >
                  <ArrowUpIcon aria-hidden="true" />
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </div>
      </div>
    </section>
  )
}
