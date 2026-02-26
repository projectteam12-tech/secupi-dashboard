/**
 * Reusable toggle switch component with Tailwind styling.
 * Props:
 *   - enabled: boolean state
 *   - onChange: callback when toggled
 *   - label: optional text label
 *   - disabled: optional, disables the toggle
 */
const ToggleSwitch = ({ enabled, onChange, label, disabled = false }) => {
    return (
        <div className="flex items-center justify-between">
            {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(!enabled)}
                className={`${enabled ? 'bg-primary-600' : 'bg-gray-300'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
            >
                <span
                    className={`${enabled ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </button>
        </div>
    )
}

export default ToggleSwitch
