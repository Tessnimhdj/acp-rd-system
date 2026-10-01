export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-gray-300 text-gray-800 focus:ring-gray-400 ' +
                className
            }
        />
    );
}
