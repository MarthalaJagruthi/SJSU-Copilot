import { supabase } from './supabaseClient';

//  Auth helpers

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signOut = () => supabase.auth.signOut();

//  Profile

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// Ensure a profile row exists for the given auth user.
// Prevents duplicates: checks by id first, then by email (Use Case: a user signs up with email/password and later
// logs in with Google using the same @sjsu.edu address).

export const ensureProfile = async (user) => {
  if (!user?.id) return null;

  // 1. Check if profile already exists by auth user id
  const { data: byId } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (byId) return byId;

  // 2. Check if a profile exists for the same email (linked to a
  //    different auth identity -- e.g. email/password vs Google OAuth).
  const { data: byEmail } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', user.email)
    .single();

  if (byEmail) return byEmail;

  // 3. No profile exists — create one
  const meta = user.user_metadata || {};
  const fullName = meta.full_name || meta.name || '';

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email,
      full_name: fullName,
    })
    .select()
    .single();

  if (error) console.error('ensureProfile insert error:', error.message);
  return data;
};

// Conversations

export const getConversations = async (userId) => {
  const { data, error } = await supabase
    .from('saved_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  return { data, error };
};

export const createConversation = async (userId, title = 'New Conversation') => {
  const { data, error } = await supabase
    .from('saved_conversations')
    .insert({ user_id: userId, title })
    .select()
    .single();
  return { data, error };
};

export const deleteConversation = async (conversationId) => {
  const { error } = await supabase
    .from('saved_conversations')
    .delete()
    .eq('id', conversationId);
  return { error };
};

// Chat messages

export const getMessages = async (conversationId) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  return { data, error };
};

export const insertMessage = async ({ conversationId, userId, role, content }) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      user_id: userId,
      role,
      content,
    })
    .select()
    .single();
  return { data, error };
};

// Uploaded documents

export const getUserUploads = async (userId) => {
  const { data, error } = await supabase
    .from('uploaded_documents')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const insertUploadRecord = async ({ ownerId, fileName, storagePath, mimeType, sizeBytes }) => {
  const { data, error } = await supabase
    .from('uploaded_documents')
    .insert({
      owner_id: ownerId,
      file_name: fileName,
      storage_path: storagePath,
      mime_type: mimeType,
      size_bytes: sizeBytes,
    })
    .select()
    .single();
  return { data, error };
};

// RAG: semantic search

export const matchDocuments = async (queryEmbedding, matchCount = 5, matchThreshold = 0.78) => {
  const { data, error } = await supabase
    .rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_count: matchCount,
      match_threshold: matchThreshold,
    });
  return { data, error };
};
