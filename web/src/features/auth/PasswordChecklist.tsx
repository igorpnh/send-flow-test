import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import { passwordRules } from './password'

export const PasswordChecklist = ({ value }: { value: string }) => (
  <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Requisitos da senha">
    {passwordRules.map((rule) => {
      const passed = rule.test(value)
      return (
        <li
          key={rule.id}
          className={`inline-flex items-center gap-1 rounded-full border-[1.5px] px-2.5 py-0.5 text-xs font-medium transition-colors ${
            passed ? 'border-ef-green bg-tint-green text-ef-green' : 'border-line text-muted'
          }`}
        >
          {passed && <CheckRoundedIcon sx={{ fontSize: 14 }} />}
          {rule.label}
        </li>
      )
    })}
  </ul>
)
