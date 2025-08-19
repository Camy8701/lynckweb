import { supabase } from '../lib/supabase'

export const messagingService = {
  // Get conversations for a user
  async getConversations(userId) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          teacher:teacher_id (
            id,
            full_name,
            avatar_url
          ),
          student:student_id (
            id,
            full_name,
            avatar_url
          ),
          courses (
            title
          ),
          messages (
            content,
            created_at,
            read_at,
            sender_id
          )
        `)
        .or(`teacher_id.eq.${userId},student_id.eq.${userId}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      // Process conversations to get latest message and unread count
      const processedConversations = data.map(conversation => {
        const messages = conversation.messages || []
        const latestMessage = messages[messages.length - 1]
        const unreadCount = messages.filter(m => 
          m.sender_id !== userId && !m.read_at
        ).length

        return {
          ...conversation,
          latestMessage,
          unreadCount,
          otherUser: conversation.teacher_id === userId 
            ? conversation.student 
            : conversation.teacher
        }
      })

      return { data: processedConversations, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get messages for a conversation
  async getMessages(conversationId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Send a message
  async sendMessage(conversationId, senderId, content, messageType = 'text', fileUrl = null) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            sender_id: senderId,
            content,
            message_type: messageType,
            file_url: fileUrl
          }
        ])
        .select(`
          *,
          sender:sender_id (
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      // Update conversation's last message time
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId)

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Create or get conversation
  async createOrGetConversation(teacherId, studentId, courseId = null) {
    try {
      // First try to find existing conversation
      const { data: existing, error: findError } = await supabase
        .from('conversations')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .single()

      if (existing && !findError) {
        return { data: existing, error: null }
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert([
          {
            teacher_id: teacherId,
            student_id: studentId,
            course_id: courseId
          }
        ])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Mark messages as read
  async markMessagesAsRead(conversationId, userId) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .is('read_at', null)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  // Subscribe to new messages in a conversation
  subscribeToMessages(conversationId, callback) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to conversation updates
  subscribeToConversations(userId, callback) {
    return supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `or(teacher_id.eq.${userId},student_id.eq.${userId})`
        },
        callback
      )
      .subscribe()
  },

  // Get unread message count for user
  async getUnreadCount(userId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .neq('sender_id', userId)
        .is('read_at', null)
        .in(
          'conversation_id',
          supabase
            .from('conversations')
            .select('id')
            .or(`teacher_id.eq.${userId},student_id.eq.${userId}`)
        )

      if (error) throw error
      return { data: data.length, error: null }
    } catch (error) {
      return { data: 0, error }
    }
  }
}