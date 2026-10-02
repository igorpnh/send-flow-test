import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import AddIcon from '@mui/icons-material/Add'
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import SearchIcon from '@mui/icons-material/Search'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import { EmptyState } from '../../shared/components/EmptyState'
import { InitialsAvatar } from '../../shared/components/InitialsAvatar'
import { ErrorState, LoadingState } from '../../shared/components/PageState'
import { useNotify } from '../../shared/notifier/context'
import type { Contact } from '../../shared/types'
import { useCurrentUser } from '../auth/useAuth'
import type { ConnectionOutletContext } from '../connections/ConnectionPage'
import { createContact, deleteContact, isPhoneTakenError, updateContact, type ContactInput } from './api'
import { ContactFormDialog } from './ContactFormDialog'
import { useContacts } from './hooks'
import { fromE164, onlyDigits } from './phone'

type DialogState = { type: 'create' } | { type: 'edit' | 'delete'; contact: Contact } | null

const matchesSearch = (contact: Contact, search: string) => {
  const term = search.trim().toLowerCase()
  if (!term) return true
  const digits = onlyDigits(term)
  return contact.name.toLowerCase().includes(term) || (digits !== '' && contact.phone.includes(digits))
}

export const ContactsPage = () => {
  const { connection } = useOutletContext<ConnectionOutletContext>()
  const { uid } = useCurrentUser()
  const { data: contacts, loading, error } = useContacts(connection.id)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [search, setSearch] = useState('')
  const notify = useNotify()
  const closeDialog = () => setDialog(null)

  const filteredContacts = useMemo(
    () => (contacts ?? []).filter((contact) => matchesSearch(contact, search)),
    [contacts, search],
  )

  const takenPhones = useMemo(
    () =>
      (contacts ?? [])
        .filter((contact) => dialog?.type !== 'edit' || contact.id !== dialog.contact.id)
        .map((contact) => onlyDigits(fromE164(contact.phone))),
    [contacts, dialog],
  )

  const handleSave = async (values: ContactInput) => {
    try {
      if (dialog?.type === 'edit') {
        await updateContact(dialog.contact, values)
        notify('Contato atualizado.')
      } else {
        await createContact(uid, connection.id, values)
        notify('Contato adicionado.')
      }
      closeDialog()
    } catch (error) {
      notify(
        isPhoneTakenError(error)
          ? 'Já existe um contato com este telefone nesta conexão.'
          : 'Não foi possível salvar o contato.',
        'error',
      )
    }
  }

  const handleDelete = async () => {
    if (dialog?.type !== 'delete') return
    try {
      await deleteContact(dialog.contact)
      notify('Contato excluído.')
    } catch {
      notify('Não foi possível excluir o contato.', 'error')
    }
  }

  const createButton = (
    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ type: 'create' })}>
      Novo contato
    </Button>
  )

  const renderContent = () => {
    if (loading) return <LoadingState />
    if (error || !contacts) return <ErrorState />
    if (contacts.length === 0)
      return (
        <EmptyState
          icon={<ContactsOutlinedIcon />}
          title="Ninguém por aqui ainda"
          description="Adicione contatos a esta conexão para poder mandar mensagens para eles."
          action={createButton}
        />
      )

    return (
      <TableContainer className="rounded-[14px] border-[1.5px] border-ink bg-surface shadow-hard">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id} hover>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <InitialsAvatar id={contact.id} name={contact.name} size="sm" />
                    <span className="font-medium">{contact.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm whitespace-nowrap">{fromE164(contact.phone)}</TableCell>
                <TableCell align="right" className="whitespace-nowrap">
                  <Tooltip title="Editar">
                    <IconButton aria-label="Editar" onClick={() => setDialog({ type: 'edit', contact })}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      aria-label="Excluir"
                      color="error"
                      onClick={() => setDialog({ type: 'delete', contact })}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredContacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" className="py-8 text-muted">
                  Nenhum contato encontrado para “{search}”.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <h2 className="m-0 font-display text-2xl font-semibold">Contatos</h2>
          {contacts && (
            <span className="rounded-full border-[1.5px] border-line px-2.5 py-0.5 font-mono text-xs text-muted">
              {contacts.length}
            </span>
          )}
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <TextField
            size="small"
            placeholder="Buscar por nome ou telefone"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full sm:w-72"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
          {createButton}
        </div>
      </div>
      {renderContent()}
      <ContactFormDialog
        open={dialog?.type === 'create' || dialog?.type === 'edit'}
        initialValues={
          dialog?.type === 'edit'
            ? { name: dialog.contact.name, phone: fromE164(dialog.contact.phone) }
            : undefined
        }
        takenPhones={takenPhones}
        onSubmit={handleSave}
        onClose={closeDialog}
      />
      <ConfirmDialog
        open={dialog?.type === 'delete'}
        title="Excluir contato"
        description={`O contato "${dialog?.type === 'delete' ? dialog.contact.name : ''}" será removido desta conexão e das mensagens em que aparece.`}
        onConfirm={handleDelete}
        onClose={closeDialog}
      />
    </>
  )
}
