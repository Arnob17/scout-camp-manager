import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Download, ArrowLeft, CheckCircle, Search } from 'lucide-react';

interface ReceiptData {
    scout: any;
    payment: {
        amount: number;
        method: string;
        transactionId?: string;
        paidAt: string;
        receivedBy: string;
    };
    campInfo: any;
}

const MoneyReceipt: React.FC = () => {
    const navigate = useNavigate();
    const [scoutId, setScoutId] = useState<string>('');
    const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Auto-focus on input when component mounts
        const input = document.getElementById('scoutIdInput');
        if (input) {
            input.focus();
        }
    }, []);

    const fetchReceiptData = async () => {
        if (!scoutId.trim()) {
            setError("Please enter a Scout ID");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');

            // Fetch scout data
            const scoutResponse = await fetch(`https://camp-backend-production.up.railway.app/api/scouts/${scoutId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!scoutResponse.ok) {
                throw new Error('Scout not found');
            }

            const scout = await scoutResponse.json();

            // Fetch camp info
            const campResponse = await fetch('https://camp-backend-production.up.railway.app/api/camp-info');
            const campInfo = await campResponse.json();

            // Mock payment data (you can replace this with actual payment API)
            const paymentData = {
                amount: scout.payment_amount || 1000,
                method: 'Cash',
                transactionId: `TXN-${Date.now()}`,
                paidAt: new Date().toISOString(),
                receivedBy: 'Camp Administration'
            };

            setReceiptData({
                scout,
                payment: paymentData,
                campInfo
            });

        } catch (error) {
            console.error('Error fetching receipt data:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch receipt data');
        } finally {
            setLoading(false);
        }
    };

    const handleNewSearch = () => {
        setScoutId('');
        setReceiptData(null);
        setError(null);
        // Focus on input after clearing
        setTimeout(() => {
            const input = document.getElementById('scoutIdInput');
            if (input) {
                input.focus();
            }
        }, 100);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setScoutId(e.target.value);
        // Clear receipt data when input changes
        if (receiptData) {
            setReceiptData(null);
        }
        setError(null);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            fetchReceiptData();
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading receipt data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            Back
                        </button>

                        <div className="flex-1">
                            <label htmlFor="scoutIdInput" className="block text-sm font-medium text-gray-700 mb-2">
                                Enter Scout ID
                            </label>
                            <div className="flex space-x-3">
                                <input
                                    id="scoutIdInput"
                                    type="text"
                                    value={scoutId}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Enter Scout ID (e.g., 1, 2, 3...)"
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    onClick={fetchReceiptData}
                                    disabled={!scoutId.trim() || loading}
                                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                                >
                                    <Search size={18} className="mr-2" />
                                    Search
                                </button>
                            </div>
                            {error && !receiptData && (
                                <p className="text-red-600 text-sm mt-2">{error}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {error && !receiptData && (
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold">Error</h3>
                                <p>{error}</p>
                            </div>
                            <button
                                onClick={handleNewSearch}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <Search size={18} className="mr-2" />
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {receiptData && (
                <>
                    {/* Action Bar - Hidden when printing */}
                    <div className="max-w-4xl mx-auto mb-6 print:hidden">
                        <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleNewSearch}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Search size={18} className="mr-2" />
                                    Search Another Scout
                                </button>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Download size={18} className="mr-2" />
                                    Download PDF
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Printer size={18} className="mr-2" />
                                    Print Receipt
                                </button>
                            </div>
                        </div>

                        {/* Current Scout Info */}
                        <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">Current Scout: {receiptData.scout.name}</h3>
                                    <p className="text-gray-600 text-sm">ID: SFC25-{receiptData.scout.id} | BS ID: {receiptData.scout.bsID}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Amount Paid</p>
                                    <p className="text-lg font-bold text-green-600">{receiptData.payment.amount} Taka</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Receipt Content */}
                    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none">
                        {/* Receipt Header */}
                        <div className="bg-green-800 text-white p-8 text-center">
                            <div className="flex items-center justify-center mb-4">
                                <CheckCircle size={48} className="text-green-300 mr-4" />
                                <div>
                                    <h1 className="text-3xl font-bold">PAYMENT RECEIPT</h1>
                                    <p className="text-green-200 mt-2">Official Payment Confirmation</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
                                <div>
                                    <p className="text-green-300">Receipt No</p>
                                    <p className="font-semibold">RC-{receiptData.scout.id}-{Date.now().toString().slice(-6)}</p>
                                </div>
                                <div>
                                    <p className="text-green-300">Date Issued</p>
                                    <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-green-300">Scout ID</p>
                                    <p className="font-semibold">SFC25-{receiptData.scout.id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Camp Information */}
                        <div className="border-b p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Camp Information</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-600">Camp Name</p>
                                    <p className="font-semibold">{receiptData.campInfo.camp_name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Dates</p>
                                    <p className="font-semibold">{receiptData.campInfo.camp_date}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Location</p>
                                    <p className="font-semibold">{receiptData.campInfo.location}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Description</p>
                                    <p className="font-semibold">{receiptData.campInfo.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Scout Information */}
                        <div className="border-b p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Scout Information</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-gray-600">Full Name</p>
                                        <p className="font-semibold text-lg">{receiptData.scout.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">BS ID</p>
                                        <p className="font-semibold">{receiptData.scout.bsID}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Unit Name</p>
                                        <p className="font-semibold">{receiptData.scout.unitName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Email</p>
                                        <p className="font-semibold">{receiptData.scout.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-gray-600">Father's Name</p>
                                        <p className="font-semibold">{receiptData.scout.fatherName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Phone</p>
                                        <p className="font-semibold">{receiptData.scout.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Blood Group</p>
                                        <p className="font-semibold">{receiptData.scout.bloodGroup || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Emergency Contact</p>
                                        <p className="font-semibold">{receiptData.scout.emergency_contact || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="border-b p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h2>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Amount Paid:</span>
                                            <span className="font-semibold text-lg">{receiptData.payment.amount} Taka</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Payment Method:</span>
                                            <span className="font-semibold">{receiptData.payment.method}</span>
                                        </div>
                                        {receiptData.payment.transactionId && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Transaction ID:</span>
                                                <span className="font-semibold">{receiptData.payment.transactionId}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Payment Date:</span>
                                            <span className="font-semibold">{new Date(receiptData.payment.paidAt).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Received By:</span>
                                            <span className="font-semibold">{receiptData.payment.receivedBy}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <span className="font-semibold text-green-600">PAID</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Amount in Words */}
                        <div className="p-6 border-b">
                            <h3 className="font-semibold text-gray-800 mb-2">Amount in Words:</h3>
                            <p className="text-lg italic">
                                {numberToWords(receiptData.payment.amount)} Taka Only
                            </p>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="p-6">
                            <h3 className="font-semibold text-gray-800 mb-3">Terms & Conditions:</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• This receipt is proof of payment for camp registration fees.</li>
                                <li>• Please keep this receipt for your records.</li>
                                <li>• Fees are non-refundable once paid.</li>
                                <li>• For any queries, contact camp administration.</li>
                                <li>• Receipt must be presented during camp check-in.</li>
                            </ul>
                        </div>

                        {/* Signatures */}
                        <div className="border-t p-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="text-center">
                                    <div className="border-t border-gray-300 mt-8 pt-4 mx-auto w-48">
                                        <p className="text-sm text-gray-600">Scout/Parent Signature</p>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="border-t border-gray-300 mt-8 pt-4 mx-auto w-48">
                                        <p className="text-sm text-gray-600">Camp Authority Signature</p>
                                        <p className="text-xs text-gray-500 mt-1">{receiptData.payment.receivedBy}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-100 p-4 text-center">
                            <p className="text-sm text-gray-600">
                                This is a computer-generated receipt. No signature required.
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Generated on {new Date().toLocaleString()}
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* Print Styles */}
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .max-w-4xl, .max-w-4xl * {
                            visibility: visible;
                        }
                        .max-w-4xl {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            box-shadow: none;
                        }
                        .print\\:shadow-none {
                            box-shadow: none !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

// Helper function to convert numbers to words
const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero';

    let words = '';

    if (num >= 1000) {
        words += numberToWords(Math.floor(num / 1000)) + ' Thousand ';
        num %= 1000;
    }

    if (num >= 100) {
        words += ones[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
    }

    if (num >= 20) {
        words += tens[Math.floor(num / 10)] + ' ';
        num %= 10;
    } else if (num >= 10) {
        words += teens[num - 10] + ' ';
        num = 0;
    }

    if (num > 0) {
        words += ones[num] + ' ';
    }

    return words.trim();
};

export default MoneyReceipt;