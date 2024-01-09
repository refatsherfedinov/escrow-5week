export default function Escrow({
    address,
    arbiter,
    beneficiary,
    value,
    approved,
    handleApprove,
}) {
    const buttonText = approved ? 'Approved' : 'Approve';
    return (
        <div className='existing-contract'>
            <ul className='fields'>
                <li>
                    <div> Arbiter </div>
                    <div> {arbiter} </div>
                </li>
                <li>
                    <div> Beneficiary </div>
                    <div> {beneficiary} </div>
                </li>
                <li>
                    <div> Value </div>
                    <div> {value} </div>
                </li>

                <div
                    className={approved ? 'buttonApproved' : 'button'}
                    id={address}
                    onClick={(e) => {
                        if (!approved) {
                            e.preventDefault();

                            handleApprove();
                        }
                    }}
                >
                    {buttonText}
                </div>
            </ul>
        </div>
    );
}
