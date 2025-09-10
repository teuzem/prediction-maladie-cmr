import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, Smile, Search, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react'
import { supabase, Message, UserProfile } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { GiphyPicker } from '../components/chat/GiphyPicker'

interface Conversation {
  id: string
  other_user_id: string
  other_user_name: string
  other_user_avatar_url?: string
  last_message_content: string
  last_message_at: string
  unread_count: number
}

export function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showGiphyPicker, setShowGiphyPicker] = useState(false)
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.other_user_id)
      
      const channel = supabase.channel(`messages:${user?.id}:${selectedConversation.other_user_id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `OR(sender_id.eq.${selectedConversation.other_user_id},recipient_id.eq.${selectedConversation.other_user_id})`
        }, payload => {
          setMessages(prev => [...prev, payload.new as Message])
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [selectedConversation, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadConversations = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase.rpc('get_conversations', { p_user_id: user.id })
      if (error) throw error
      setConversations(data || [])
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du chargement des conversations.")
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (otherUserId: string) => {
    if (!user) return
    try {
      const { data, error } = await supabase.rpc('get_messages_for_conversation', {
        p_user_id_1: user.id,
        p_user_id_2: otherUserId
      })
      if (error) throw error
      setMessages(data || [])
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du chargement des messages.")
    }
  }

  const sendMessage = async (content: string, type: 'text' | 'gif' = 'text') => {
    if (!content.trim() || !selectedConversation || !user) return

    const messagePayload: Partial<Message> = {
      sender_id: user.id,
      recipient_id: selectedConversation.other_user_id,
      content: type === 'text' ? content : '',
      gif_url: type === 'gif' ? content : undefined,
      message_type: type,
    }

    const { error } = await supabase.from('messages').insert(messagePayload)

    if (error) {
      toast.error("Erreur lors de l'envoi du message.")
    } else {
      if (type === 'text') setNewMessage('')
      if (showGiphyPicker) setShowGiphyPicker(false)
    }
  }

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div></div>
  }

  const ConversationList = () => (
    <div className={`w-full md:w-1/3 bg-white border-r border-secondary-200 flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
      <div className="p-6 border-b border-secondary-200">
        <h1 className="text-2xl font-heading font-bold text-secondary-900 mb-4">Messages</h1>
        <div className="relative"><Search className="absolute left-3 top-3 w-5 h-5 text-secondary-400" /><input type="text" placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg" /></div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <motion.div key={conv.id} whileHover={{ backgroundColor: '#f9fafb' }} onClick={() => setSelectedConversation(conv)} className={`p-4 border-b border-secondary-100 cursor-pointer ${selectedConversation?.id === conv.id ? 'bg-primary-50' : ''}`}>
            <div className="flex items-start space-x-3">
              <div className="relative"><div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center"><span className="text-primary-600 font-semibold">{conv.other_user_name.split(' ').map(n => n[0]).join('')}</span></div></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1"><h3 className="text-sm font-semibold text-secondary-900 truncate">{conv.other_user_name}</h3><span className="text-xs text-secondary-500">{new Date(conv.last_message_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span></div>
                <p className="text-sm text-secondary-600 truncate">{conv.last_message_content}</p>
                {conv.unread_count > 0 && <div className="mt-2"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">{conv.unread_count} nouveau{conv.unread_count > 1 ? 'x' : ''}</span></div>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const ChatArea = () => (
    <div className={`flex-1 flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
      {selectedConversation ? (
        <>
          <div className="p-4 bg-white border-b border-secondary-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={() => setSelectedConversation(null)} className="md:hidden p-2 -ml-2 text-secondary-600"><ArrowLeft className="w-5 h-5" /></button>
              <div className="relative"><div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"><span className="text-primary-600 font-semibold">{selectedConversation.other_user_name.split(' ').map(n => n[0]).join('')}</span></div></div>
              <div><h3 className="font-semibold text-secondary-900">{selectedConversation.other_user_name}</h3></div>
            </div>
            <div className="flex items-center space-x-2"><button className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg"><Phone className="w-5 h-5" /></button><button className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg"><Video className="w-5 h-5" /></button><button className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg"><MoreVertical className="w-5 h-5" /></button></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary-100/50">
            {messages.map((message) => (
              <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender_id === user?.id ? 'bg-primary-600 text-white' : 'bg-white border text-secondary-900'}`}>
                  {message.message_type === 'text' && <p className="text-sm">{message.content}</p>}
                  {message.message_type === 'gif' && <img src={message.gif_url} alt="GIF" className="rounded-md" />}
                  <p className={`text-xs mt-1 ${message.sender_id === user?.id ? 'text-primary-100' : 'text-secondary-500'}`}>{new Date(message.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 bg-white border-t border-secondary-200 relative">
            <AnimatePresence>{showGiphyPicker && (<GiphyPicker onSelect={(gifUrl) => sendMessage(gifUrl, 'gif')} onClose={() => setShowGiphyPicker(false)}/>)}</AnimatePresence>
            <div className="flex items-center space-x-3">
              <button onClick={() => setShowGiphyPicker(!showGiphyPicker)} className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg"><Smile className="w-5 h-5" /></button>
              <button className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg"><Paperclip className="w-5 h-5" /></button>
              <div className="flex-1 relative"><input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage(newMessage)} placeholder="Tapez votre message..." className="w-full px-4 py-3 border border-secondary-300 rounded-lg" /></div>
              <button onClick={() => sendMessage(newMessage)} disabled={!newMessage.trim()} className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"><Send className="w-5 h-5" /></button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 items-center justify-center hidden md:flex"><div className="text-center"><div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6"><Send className="w-12 h-12 text-primary-600" /></div><h3 className="text-xl font-semibold text-secondary-900 mb-2">Sélectionnez une conversation</h3><p className="text-secondary-600">Choisissez une conversation pour commencer à discuter</p></div></div>
      )}
    </div>
  )

  return (
    <div className="h-screen bg-secondary-50 flex">
      <ConversationList />
      <ChatArea />
    </div>
  )
}
