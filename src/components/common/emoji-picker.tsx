import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, X } from 'lucide-react'
import { useState } from 'react'

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
  '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐',
  '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦',
  '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞',
  '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿',
  '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖',
  '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
  '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇',
  '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
  '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕',
  '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳',
  '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛',
  '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖',
  '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈',
  '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨',
  '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔',
  '🌍', '🌎', '🌏', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓',
  '🌔', '🌙', '🌛', '🌜', '⭐', '🌟', '💫', '⚡', '☄️', '💥',
  '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌦️', '🌧️', '⛈️', '🌩️',
  '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☔', '☂️',
  '🌊', '🌫️',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️',
  '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️',
  '🗨️', '🗯️', '💭', '💤'
]

export interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClear?: () => void
  trigger?: React.ReactNode
}

export const EmojiPicker = ({ onEmojiSelect, onClear, trigger }: EmojiPickerProps) => {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredEmojis = search
    ? EMOJIS.filter(emoji => 
        emoji.includes(search) || 
        // Simple emoji name matching - could be enhanced with a proper emoji library
        (search.includes('smile') && ['😀', '😃', '😄', '😁', '😊', '🙂'].includes(emoji)) ||
        (search.includes('love') && ['❤️', '😍', '🥰', '💕', '💖'].includes(emoji)) ||
        (search.includes('sad') && ['😢', '😭', '😔', '😞', '☹️'].includes(emoji)) ||
        (search.includes('angry') && ['😠', '😡', '🤬', '😤'].includes(emoji)) ||
        (search.includes('cat') && ['😺', '😸', '😹', '😻', '🐱'].includes(emoji)) ||
        (search.includes('dog') && ['🐶', '🐕', '🐩'].includes(emoji))
      )
    : EMOJIS

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji)
    setIsOpen(false)
    setSearch('')
  }

  const handleClear = () => {
    onClear?.()
    setIsOpen(false)
    setSearch('')
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            添加表情
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start" side="bottom">
        <div className="space-y-3">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索表情..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-8 h-9"
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => setSearch('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* 表情网格 */}
          <ScrollArea className="h-48">
            <div className="grid grid-cols-8 gap-1 pr-3">
              {filteredEmojis.map((emoji, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-lg hover:bg-accent"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
            
            {filteredEmojis.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                没有找到匹配的表情
              </div>
            )}
          </ScrollArea>

          {/* 清除按钮 */}
          {onClear && (
            <div className="border-t pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={handleClear}
              >
                <X className="h-4 w-4 mr-1" />
                清除表情
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}