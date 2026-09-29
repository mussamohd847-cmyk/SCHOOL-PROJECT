import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import {
  Page,
  Card,
  Table,
  Modal,
  Field,
  fmtMoney,
} from "../components/Page";

/* =====================================================
   EMPTY FORMS
===================================================== */

const EMPTY_PAYMENT_FORM = {
  student_id: "",
  fee_structure_id: "",
  amount: "",
  payment_date: new Date().toISOString().slice(0, 10),
  payment_method: "CASH",
  reference_number: "",
  remarks: "",
};

const EMPTY_FEE_FORM = {
  year_id: "",
  academic_year_id: "",
  term_id: "",
  class_id: "",
  fee_type: "",
  amount: "",
  due_date: "",
};

const METHOD_LABELS = {
  CASH: "Cash",
  BANK: "Bank",
  MOBILE_MONEY: "Mobile Money",
  CARD: "Card",
  OTHER: "Other",
};

/* =====================================================
   HELPERS
===================================================== */

function extractData(response) {
  const data = response?.data?.data ?? response?.data;
  return Array.isArray(data) ? data : [];
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    fallback
  );
}

function normalizeStudent(student) {
  return {
    ...student,

    admissionNo:
      student.admissionNo ??
      student.admission_no ??
      "",

    firstName:
      student.firstName ??
      student.first_name ??
      "",

    middleName:
      student.middleName ??
      student.middle_name ??
      "",

    lastName:
      student.lastName ??
      student.last_name ??
      "",

    schoolClassId:
      student.schoolClassId ??
      student.school_class_id ??
      student.classId ??
      student.class_id ??
      null,

    status: String(
      student.status ?? "active"
    ).toLowerCase(),
  };
}

function normalizeFee(fee) {
  return {
    ...fee,

    feeName:
      fee.feeName ??
      fee.fee_name ??
      fee.feeType ??
      fee.fee_type ??
      "Fee",

    feeType:
      fee.feeType ??
      fee.fee_type ??
      fee.feeName ??
      fee.fee_name ??
      "",

    classId:
      fee.classId ??
      fee.class_id ??
      null,

    yearId:
      fee.yearId ??
      fee.year_id ??
      null,

    academicYearId:
      fee.academicYearId ??
      fee.academic_year_id ??
      fee.yearId ??
      fee.year_id ??
      null,

    termId:
      fee.termId ??
      fee.term_id ??
      null,

    amount: Number(fee.amount || 0),

    dueDate:
      fee.dueDate ??
      fee.due_date ??
      "",
  };
}

function normalizeClass(item) {
  return {
    ...item,

    name:
      item.name ??
      item.className ??
      item.class_name ??
      item.title ??
      `Class ${item.id}`,

    level:
      item.level ??
      item.levelName ??
      item.level_name ??
      "",
  };
}

function normalizeAcademicYear(item) {
  return {
    ...item,

    name:
      item.name ??
      item.yearName ??
      item.year_name ??
      String(item.id),

    status: String(
      item.status ?? "ACTIVE"
    ).toUpperCase(),
  };
}

function normalizeTerm(item) {
  return {
    ...item,

    name:
      item.name ??
      item.termName ??
      item.term_name ??
      item.title ??
      `Term ${item.id}`,

    academicYearId:
      item.academicYearId ??
      item.academic_year_id ??
      null,
  };
}

function normalizePayment(payment) {
  return {
    ...payment,

    studentId:
      payment.studentId ??
      payment.student_id ??
      "",

    feeStructureId:
      payment.feeStructureId ??
      payment.fee_structure_id ??
      "",

    paymentDate:
      payment.paymentDate ??
      payment.payment_date ??
      "",

    paymentMethod:
      payment.paymentMethod ??
      payment.payment_method ??
      "",

    referenceNumber:
      payment.referenceNumber ??
      payment.reference_number ??
      "",

    amount: Number(payment.amount || 0),

    remarks:
      payment.remarks ??
      "",
  };
}

function getStudentName(student) {
  if (!student) {
    return "Unknown Student";
  }

  return [
    student.firstName,
    student.middleName,
    student.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function getClassName(classes, classId) {
  const item = classes.find(
    (entry) =>
      Number(entry.id) === Number(classId)
  );

  return item?.name || "—";
}

function getYearName(years, yearId) {
  const item = years.find(
    (entry) =>
      Number(entry.id) === Number(yearId)
  );

  return item?.name || "—";
}

function getTermName(terms, termId) {
  const item = terms.find(
    (entry) =>
      Number(entry.id) === Number(termId)
  );

  return item?.name || "—";
}

/* =====================================================
   COMPONENT
===================================================== */

export default function Finance() {
  /* ===================================================
     DATA
  =================================================== */

  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);

  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);

  /* ===================================================
     LOADING
  =================================================== */

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feeSaving, setFeeSaving] = useState(false);

  /* ===================================================
     PAYMENT MODAL
  =================================================== */

  const [paymentModal, setPaymentModal] =
    useState(false);

  const [editingPayment, setEditingPayment] =
    useState(null);

  /* ===================================================
     FEE MODAL
  =================================================== */

  const [feeModal, setFeeModal] =
    useState(false);

  const [editingFee, setEditingFee] =
    useState(null);

  const [feeForm, setFeeForm] =
    useState(EMPTY_FEE_FORM);

  /* ===================================================
     BALANCE / RECEIPT
  =================================================== */

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [balance, setBalance] =
    useState(null);

  const [balanceLoading, setBalanceLoading] =
    useState(false);

  const [receiptPayment, setReceiptPayment] =
    useState(null);

  /* ===================================================
     PAYMENT FORM
  =================================================== */

  const [form, setForm] =
    useState(EMPTY_PAYMENT_FORM);

  /* ===================================================
     FILTERS
  =================================================== */

  const [search, setSearch] =
    useState("");

  const [methodFilter, setMethodFilter] =
    useState("ALL");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  /* ===================================================
     LOAD DATA
  =================================================== */

  const loadData = async () => {
    setLoading(true);

    try {
      const [
        paymentsResponse,
        studentsResponse,
        feesResponse,
        classesResponse,
        yearsResponse,
        termsResponse,
      ] = await Promise.all([
        api.get("/payments"),
        api.get("/students"),
        api.get("/fees"),
        api.get("/classes"),
        api.get("/academic-years"),
        api.get("/terms"),
      ]);

      setPayments(
        extractData(paymentsResponse).map(
          normalizePayment
        )
      );

      setStudents(
        extractData(studentsResponse).map(
          normalizeStudent
        )
      );

      setFees(
        extractData(feesResponse).map(
          normalizeFee
        )
      );

      setClasses(
        extractData(classesResponse).map(
          normalizeClass
        )
      );

      setAcademicYears(
        extractData(yearsResponse).map(
          normalizeAcademicYear
        )
      );

      setTerms(
        extractData(termsResponse).map(
          normalizeTerm
        )
      );
    } catch (error) {
      console.error(
        "Finance load error:",
        error
      );

      alert(
        getErrorMessage(
          error,
          "Failed to load finance data."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ===================================================
     BALANCE
  =================================================== */

  const loadBalance = async (studentId) => {
    if (!studentId) {
      setBalance(null);
      return;
    }

    setBalanceLoading(true);

    try {
      const response = await api.get(
        `/payments/student/${studentId}/balance`
      );

      const data =
        response?.data?.data ??
        response?.data;

      setBalance(data || null);
    } catch (error) {
      console.error(
        "Balance error:",
        error
      );

      setBalance(null);

      alert(
        getErrorMessage(
          error,
          "Failed to load student balance."
        )
      );
    } finally {
      setBalanceLoading(false);
    }
  };

  /* ===================================================
     CREATE PAYMENT
  =================================================== */

  const openCreatePayment = () => {
    setEditingPayment(null);

    setForm({
      ...EMPTY_PAYMENT_FORM,
      payment_date:
        new Date()
          .toISOString()
          .slice(0, 10),
    });

    setSelectedStudent(null);
    setBalance(null);

    setPaymentModal(true);
  };

  /* ===================================================
     EDIT PAYMENT
  =================================================== */

  const openEditPayment = (payment) => {
    setEditingPayment(payment);

    const student = students.find(
      (item) =>
        Number(item.id) ===
        Number(payment.studentId)
    );

    setForm({
      student_id:
        payment.studentId || "",

      fee_structure_id:
        payment.feeStructureId || "",

      amount:
        payment.amount || "",

      payment_date:
        payment.paymentDate ||
        new Date()
          .toISOString()
          .slice(0, 10),

      payment_method:
        payment.paymentMethod ||
        "CASH",

      reference_number:
        payment.referenceNumber ||
        "",

      remarks:
        payment.remarks ||
        "",
    });

    setSelectedStudent(
      student || null
    );

    if (student) {
      loadBalance(student.id);
    } else {
      setBalance(null);
    }

    setPaymentModal(true);
  };

  /* ===================================================
     CLOSE PAYMENT
  =================================================== */

  const closePaymentModal = () => {
    if (saving) {
      return;
    }

    setPaymentModal(false);
    setEditingPayment(null);
    setSelectedStudent(null);
    setBalance(null);

    setForm({
      ...EMPTY_PAYMENT_FORM,
      payment_date:
        new Date()
          .toISOString()
          .slice(0, 10),
    });
  };

  /* ===================================================
     STUDENT CHANGE
  =================================================== */

  const handleStudentChange = async (
    studentId
  ) => {
    const student = students.find(
      (item) =>
        Number(item.id) ===
        Number(studentId)
    );

    setSelectedStudent(
      student || null
    );

    setForm((current) => ({
      ...current,
      student_id: studentId,
      fee_structure_id: "",
      amount: "",
    }));

    if (student) {
      await loadBalance(student.id);
    } else {
      setBalance(null);
    }
  };

  /* ===================================================
     FEE CHANGE
  =================================================== */

  const handleFeeChange = (feeId) => {
    const fee = fees.find(
      (item) =>
        Number(item.id) ===
        Number(feeId)
    );

    setForm((current) => ({
      ...current,
      fee_structure_id: feeId,
      amount: fee
        ? String(fee.amount)
        : "",
    }));
  };

  /* ===================================================
     SAVE PAYMENT
  =================================================== */

  const savePayment = async (event) => {
    event.preventDefault();

    if (!form.student_id) {
      alert("Please select a student.");
      return;
    }

    if (!form.fee_structure_id) {
      alert(
        "Please select a fee structure."
      );
      return;
    }

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      alert(
        "Enter a valid payment amount."
      );
      return;
    }

    if (!form.payment_date) {
      alert(
        "Please select payment date."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        student_id:
          Number(form.student_id),

        fee_structure_id:
          Number(form.fee_structure_id),

        amount:
          Number(form.amount),

        payment_date:
          form.payment_date,

        payment_method:
          form.payment_method,

        reference_number:
          form.reference_number.trim() ||
          null,

        remarks:
          form.remarks.trim() ||
          null,
      };

      if (editingPayment) {
        await api.put(
          `/payments/${editingPayment.id}`,
          payload
        );
      } else {
        await api.post(
          "/payments",
          payload
        );
      }

      closePaymentModal();

      await loadData();
    } catch (error) {
      console.error(
        "Save payment error:",
        error
      );

      alert(
        getErrorMessage(
          error,
          "Failed to save payment."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  /* ===================================================
     DELETE PAYMENT
  =================================================== */

  const deletePayment = async (
    payment
  ) => {
    const confirmed =
      window.confirm(
        `Delete payment of ${fmtMoney(
          payment.amount
        )}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/payments/${payment.id}`
      );

      await loadData();
    } catch (error) {
      console.error(
        "Delete payment error:",
        error
      );

      alert(
        getErrorMessage(
          error,
          "Failed to delete payment."
        )
      );
    }
  };

  /* ===================================================
     CREATE FEE
  =================================================== */

  const openCreateFee = () => {
    setEditingFee(null);

    const activeYear =
      academicYears.find(
        (year) =>
          year.status === "ACTIVE"
      );

    setFeeForm({
      ...EMPTY_FEE_FORM,

      year_id:
        activeYear?.id
          ? String(activeYear.id)
          : "",

      academic_year_id:
        activeYear?.id
          ? String(activeYear.id)
          : "",
    });

    setFeeModal(true);
  };

  /* ===================================================
     EDIT FEE
  =================================================== */

  const openEditFee = (fee) => {
    setEditingFee(fee);

    setFeeForm({
      year_id:
        fee.yearId
          ? String(fee.yearId)
          : "",

      academic_year_id:
        fee.academicYearId
          ? String(
              fee.academicYearId
            )
          : fee.yearId
          ? String(fee.yearId)
          : "",

      term_id:
        fee.termId
          ? String(fee.termId)
          : "",

      class_id:
        fee.classId
          ? String(fee.classId)
          : "",

      fee_type:
        fee.feeType ||
        fee.feeName ||
        "",

      amount:
        fee.amount !== null &&
        fee.amount !== undefined
          ? String(fee.amount)
          : "",

      due_date:
        fee.dueDate || "",
    });

    setFeeModal(true);
  };

  /* ===================================================
     CLOSE FEE
  =================================================== */

  const closeFeeModal = () => {
    if (feeSaving) {
      return;
    }

    setFeeModal(false);
    setEditingFee(null);
    setFeeForm({
      ...EMPTY_FEE_FORM,
    });
  };

  /* ===================================================
     SAVE FEE
  =================================================== */

  const saveFee = async (event) => {
    event.preventDefault();

    if (!feeForm.year_id) {
      alert(
        "Please select academic year."
      );
      return;
    }

    if (!feeForm.term_id) {
      alert("Please select term.");
      return;
    }

    if (!feeForm.class_id) {
      alert("Please select class.");
      return;
    }

    if (!feeForm.fee_type.trim()) {
      alert(
        "Please enter fee type."
      );
      return;
    }

    if (
      !feeForm.amount ||
      Number(feeForm.amount) <= 0
    ) {
      alert(
        "Please enter a valid amount."
      );
      return;
    }

    setFeeSaving(true);

    try {
      const payload = {
        year_id:
          Number(feeForm.year_id),

        academic_year_id:
          Number(
            feeForm.academic_year_id ||
              feeForm.year_id
          ),

        term_id:
          Number(feeForm.term_id),

        class_id:
          Number(feeForm.class_id),

        fee_type:
          feeForm.fee_type.trim(),

        amount:
          Number(feeForm.amount),

        due_date:
          feeForm.due_date ||
          null,
      };

      if (editingFee) {
        await api.put(
          `/fees/${editingFee.id}`,
          payload
        );
      } else {
        await api.post(
          "/fees",
          payload
        );
      }

      closeFeeModal();

      await loadData();

      alert(
        editingFee
          ? "Fee structure updated successfully."
          : "Fee structure created successfully."
      );
    } catch (error) {
      console.error(
        "Save fee error:",
        error
      );

      alert(
        getErrorMessage(
          error,
          "Failed to save fee structure."
        )
      );
    } finally {
      setFeeSaving(false);
    }
  };

  /* ===================================================
     DELETE FEE
  =================================================== */

  const deleteFee = async (fee) => {
    const confirmed =
      window.confirm(
        `Delete "${fee.feeName}" fee structure?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/fees/${fee.id}`
      );

      await loadData();
    } catch (error) {
      console.error(
        "Delete fee error:",
        error
      );

      alert(
        getErrorMessage(
          error,
          "Failed to delete fee structure."
        )
      );
    }
  };

  /* ===================================================
     FILTER PAYMENTS
  =================================================== */

  const filteredPayments =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return payments.filter(
        (payment) => {
          const student =
            students.find(
              (item) =>
                Number(item.id) ===
                Number(
                  payment.studentId
                )
            );

          const studentName =
            getStudentName(student);

          const admissionNo =
            student?.admissionNo || "";

          const method =
            payment.paymentMethod || "";

          const reference =
            payment.referenceNumber || "";

          const matchesSearch =
            !keyword ||
            studentName
              .toLowerCase()
              .includes(keyword) ||
            admissionNo
              .toLowerCase()
              .includes(keyword) ||
            reference
              .toLowerCase()
              .includes(keyword) ||
            String(payment.id).includes(
              keyword
            );

          const matchesMethod =
            methodFilter === "ALL" ||
            method === methodFilter;

          const paymentDate =
            payment.paymentDate || "";

          const matchesFrom =
            !dateFrom ||
            paymentDate >= dateFrom;

          const matchesTo =
            !dateTo ||
            paymentDate <= dateTo;

          return (
            matchesSearch &&
            matchesMethod &&
            matchesFrom &&
            matchesTo
          );
        }
      );
    }, [
      payments,
      students,
      search,
      methodFilter,
      dateFrom,
      dateTo,
    ]);

  /* ===================================================
     STATISTICS
  =================================================== */

  const totalCollected =
    useMemo(() => {
      return filteredPayments.reduce(
        (sum, payment) =>
          sum +
          Number(payment.amount || 0),
        0
      );
    }, [filteredPayments]);

  const totalPayments =
    filteredPayments.length;

  const cashTotal =
    useMemo(() => {
      return filteredPayments
        .filter(
          (payment) =>
            payment.paymentMethod ===
            "CASH"
        )
        .reduce(
          (sum, payment) =>
            sum +
            Number(
              payment.amount || 0
            ),
          0
        );
    }, [filteredPayments]);

  const nonCashTotal =
    totalCollected -
    cashTotal;

  /* ===================================================
     RECEIPT NUMBER
  =================================================== */

  const getReceiptNumber = (
    payment
  ) => {
    if (payment.referenceNumber) {
      return payment.referenceNumber;
    }

    const year =
      payment.paymentDate
        ? String(
            payment.paymentDate
          ).slice(0, 4)
        : String(
            new Date().getFullYear()
          );

    return `RCP-${year}-${String(
      payment.id
    ).padStart(5, "0")}`;
  };

  /* ===================================================
     PRINT RECEIPT
  =================================================== */

  const printReceipt = (
    payment
  ) => {
    const student =
      students.find(
        (item) =>
          Number(item.id) ===
          Number(
            payment.studentId
          )
      );

    const fee =
      fees.find(
        (item) =>
          Number(item.id) ===
          Number(
            payment.feeStructureId
          )
      );

    const receiptNo =
      getReceiptNumber(payment);

    const studentName =
      getStudentName(student);

    const paymentMethod =
      METHOD_LABELS[
        payment.paymentMethod
      ] ||
      payment.paymentMethod ||
      "—";

    const receiptWindow =
      window.open(
        "",
        "_blank",
        "width=800,height=900"
      );

    if (!receiptWindow) {
      alert(
        "Please allow popups to print the receipt."
      );
      return;
    }

    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>
          Payment Receipt ${receiptNo}
        </title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #222;
            background: #fff;
          }

          .receipt {
            max-width: 700px;
            margin: auto;
            border: 1px solid #ddd;
            padding: 35px;
          }

          .header {
            text-align: center;
            border-bottom: 2px solid #222;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }

          .header h1 {
            margin: 0;
            font-size: 28px;
          }

          .header p {
            margin: 5px 0;
          }

          .receipt-title {
            text-align: center;
            font-size: 22px;
            font-weight: bold;
            margin: 20px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          td {
            padding: 12px 8px;
            border-bottom: 1px solid #eee;
          }

          td:first-child {
            font-weight: bold;
            width: 40%;
          }

          .amount {
            font-size: 25px;
            font-weight: bold;
          }

          .footer {
            margin-top: 35px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }

          @media print {
            body {
              padding: 0;
            }

            .receipt {
              border: none;
            }
          }
        </style>
      </head>

      <body>
        <div class="receipt">

          <div class="header">
            <h1>
              NIA SCHOOL & MADRASA
            </h1>

            <p>
              Fees Payment Receipt
            </p>
          </div>

          <div class="receipt-title">
            OFFICIAL RECEIPT
          </div>

          <table>

            <tr>
              <td>Receipt No.</td>
              <td>${receiptNo}</td>
            </tr>

            <tr>
              <td>Student</td>
              <td>${studentName}</td>
            </tr>

            <tr>
              <td>Admission No.</td>
              <td>
                ${student?.admissionNo || "—"}
              </td>
            </tr>

            <tr>
              <td>Fee</td>
              <td>
                ${fee?.feeName || "—"}
              </td>
            </tr>

            <tr>
              <td>Payment Date</td>
              <td>
                ${payment.paymentDate || "—"}
              </td>
            </tr>

            <tr>
              <td>Payment Method</td>
              <td>
                ${paymentMethod}
              </td>
            </tr>

            <tr>
              <td>Reference</td>
              <td>
                ${payment.referenceNumber || "—"}
              </td>
            </tr>

            <tr>
              <td>Amount Paid</td>
              <td class="amount">
                ${fmtMoney(payment.amount)}
              </td>
            </tr>

            <tr>
              <td>Remarks</td>
              <td>
                ${payment.remarks || "—"}
              </td>
            </tr>

          </table>

          <div class="footer">
            <p>
              Thank you for your payment.
            </p>

            <p>
              Generated by NIA School &
              Madrasa Management System
            </p>
          </div>

        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);

    receiptWindow.document.close();
  };

  /* ===================================================
     PAYMENT TABLE
  =================================================== */

  const paymentTableRows =
    filteredPayments.map(
      (payment) => {
        const student =
          students.find(
            (item) =>
              Number(item.id) ===
              Number(
                payment.studentId
              )
          );

        const fee =
          fees.find(
            (item) =>
              Number(item.id) ===
              Number(
                payment.feeStructureId
              )
          );

        return {
          ...payment,

          studentName:
            getStudentName(student),

          admissionNo:
            student?.admissionNo ||
            "—",

          feeName:
            fee?.feeName ||
            "—",

          methodLabel:
            METHOD_LABELS[
              payment.paymentMethod
            ] ||
            payment.paymentMethod ||
            "—",

          receiptNo:
            getReceiptNumber(
              payment
            ),
        };
      }
    );

  /* ===================================================
     FEE TABLE
  =================================================== */

  const feeTableRows =
    fees.map((fee) => ({
      ...fee,

      className:
        getClassName(
          classes,
          fee.classId
        ),

      yearName:
        getYearName(
          academicYears,
          fee.academicYearId ||
            fee.yearId
        ),

      termName:
        getTermName(
          terms,
          fee.termId
        ),
    }));

  /* ===================================================
     PAYMENT FEE OPTIONS
  =================================================== */

  const availablePaymentFees =
    fees.filter((fee) => {
      if (!selectedStudent) {
        return true;
      }

      if (!fee.classId) {
        return true;
      }

      return (
        Number(fee.classId) ===
        Number(
          selectedStudent.schoolClassId
        )
      );
    });

  /* ===================================================
     TERMS FOR SELECTED YEAR
  =================================================== */

  const availableTerms =
    useMemo(() => {
      if (!feeForm.year_id) {
        return terms;
      }

      const matching =
        terms.filter(
          (term) =>
            !term.academicYearId ||
            Number(
              term.academicYearId
            ) ===
              Number(
                feeForm.year_id
              )
        );

      return matching.length
        ? matching
        : terms;
    }, [
      terms,
      feeForm.year_id,
    ]);

  /* ===================================================
     UI
  =================================================== */

  return (
    <Page
      title="Finance"
      subtitle="Fees, payments, balances and receipts"
      actions={
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={openCreateFee}
          >
            + Fee Structure
          </button>

          <button
            className="primary"
            type="button"
            onClick={openCreatePayment}
          >
            + Record Payment
          </button>
        </div>
      }
    >

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="stats">

        <div className="stat green">
          <span>💰</span>

          <div>
            <strong>
              {fmtMoney(
                totalCollected
              )}
            </strong>

            <small>
              Total Collected
            </small>
          </div>
        </div>

        <div className="stat blue">
          <span>🧾</span>

          <div>
            <strong>
              {totalPayments}
            </strong>

            <small>
              Payments
            </small>
          </div>
        </div>

        <div className="stat">
          <span>💵</span>

          <div>
            <strong>
              {fmtMoney(
                cashTotal
              )}
            </strong>

            <small>
              Cash
            </small>
          </div>
        </div>

        <div className="stat">
          <span>🏦</span>

          <div>
            <strong>
              {fmtMoney(
                nonCashTotal
              )}
            </strong>

            <small>
              Bank / Mobile / Card
            </small>
          </div>
        </div>

      </div>

      {/* =================================================
          FEE STRUCTURES
      ================================================= */}

      <Card>

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
              }}
            >
              Fee Structures
            </h3>

            <p
              style={{
                margin:
                  "5px 0 0",
                color: "#666",
                fontSize: "14px",
              }}
            >
              Fees configured by class,
              academic year and term.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateFee}
          >
            + Add Fee
          </button>
        </div>

        {loading ? (
          <div className="empty">
            Loading fee structures...
          </div>
        ) : feeTableRows.length === 0 ? (
          <div className="empty">
            No fee structures found.
          </div>
        ) : (
          <Table
            rows={feeTableRows}
            columns={[
              {
                key: "feeName",
                label: "Fee Type",
              },

              {
                key: "className",
                label: "Class",
              },

              {
                key: "yearName",
                label:
                  "Academic Year",
              },

              {
                key: "termName",
                label: "Term",
              },

              {
                key: "amount",
                label: "Amount",
                render: (row) =>
                  fmtMoney(
                    row.amount
                  ),
              },

              {
                key: "dueDate",
                label:
                  "Due Date",
                render: (row) =>
                  row.dueDate ||
                  "—",
              },
            ]}
            actions={(row) => (
              <div
                style={{
                  display:
                    "flex",
                  gap: "6px",
                  flexWrap:
                    "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    openEditFee(
                      row
                    )
                  }
                  title="Edit fee"
                >
                  ✏️
                </button>

                <button
                  type="button"
                  className="icon danger"
                  onClick={() =>
                    deleteFee(
                      row
                    )
                  }
                  title="Delete fee"
                >
                  🗑
                </button>
              </div>
            )}
          />
        )}

      </Card>

      {/* =================================================
          PAYMENT FILTERS
      ================================================= */}

      <Card>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(220px, 2fr) repeat(3, minmax(140px, 1fr))",
            gap: "16px",
            alignItems: "end",
          }}
        >

          <Field label="Search">
            <input
              type="search"
              placeholder="Search student, admission no, reference..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </Field>

          <Field label="Payment Method">
            <select
              value={methodFilter}
              onChange={(event) =>
                setMethodFilter(
                  event.target.value
                )
              }
            >
              <option value="ALL">
                All Methods
              </option>

              <option value="CASH">
                Cash
              </option>

              <option value="BANK">
                Bank
              </option>

              <option value="MOBILE_MONEY">
                Mobile Money
              </option>

              <option value="CARD">
                Card
              </option>

              <option value="OTHER">
                Other
              </option>
            </select>
          </Field>

          <Field label="From">
            <input
              type="date"
              value={dateFrom}
              onChange={(event) =>
                setDateFrom(
                  event.target.value
                )
              }
            />
          </Field>

          <Field label="To">
            <input
              type="date"
              value={dateTo}
              onChange={(event) =>
                setDateTo(
                  event.target.value
                )
              }
            />
          </Field>

        </div>

        <div
          style={{
            marginTop: "16px",
            display: "flex",
            justifyContent:
              "flex-end",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setMethodFilter("ALL");
              setDateFrom("");
              setDateTo("");
            }}
          >
            Clear Filters
          </button>
        </div>

      </Card>

      {/* =================================================
          PAYMENTS
      ================================================= */}

      <Card>

        {loading ? (
          <div className="empty">
            Loading payments...
          </div>
        ) : paymentTableRows.length === 0 ? (
          <div className="empty">
            No payments found.
          </div>
        ) : (
          <Table
            rows={paymentTableRows}
            columns={[
              {
                key: "receiptNo",
                label: "Receipt No.",
              },

              {
                key: "studentName",
                label: "Student",
              },

              {
                key: "admissionNo",
                label:
                  "Admission No.",
              },

              {
                key: "feeName",
                label: "Fee",
              },

              {
                key: "amount",
                label: "Amount",
                render: (row) =>
                  fmtMoney(
                    row.amount
                  ),
              },

              {
                key: "paymentDate",
                label: "Date",
              },

              {
                key: "methodLabel",
                label: "Method",
              },

              {
                key: "referenceNumber",
                label:
                  "Reference",
                render: (row) =>
                  row.referenceNumber ||
                  "—",
              },
            ]}
            actions={(row) => (
              <div
                style={{
                  display:
                    "flex",
                  gap: "6px",
                  flexWrap:
                    "wrap",
                }}
              >

                <button
                  type="button"
                  onClick={() =>
                    printReceipt(
                      row
                    )
                  }
                  title="Print receipt"
                >
                  🧾
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openEditPayment(
                      row
                    )
                  }
                  title="Edit payment"
                >
                  ✏️
                </button>

                <button
                  type="button"
                  className="icon danger"
                  onClick={() =>
                    deletePayment(
                      row
                    )
                  }
                  title="Delete payment"
                >
                  🗑
                </button>

              </div>
            )}
          />
        )}

      </Card>

      {/* =================================================
          FEE MODAL
      ================================================= */}

      {feeModal && (
        <Modal
          title={
            editingFee
              ? "Edit Fee Structure"
              : "Create Fee Structure"
          }
          onClose={
            closeFeeModal
          }
        >

          <form
            onSubmit={saveFee}
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "18px",
            }}
          >

            <Field label="Academic Year">
              <select
                value={
                  feeForm.year_id
                }
                onChange={(event) =>
                  setFeeForm(
                    (current) => ({
                      ...current,

                      year_id:
                        event.target
                          .value,

                      academic_year_id:
                        event.target
                          .value,

                      term_id: "",
                    })
                  )
                }
                required
              >
                <option value="">
                  Select academic year
                </option>

                {academicYears.map(
                  (year) => (
                    <option
                      key={year.id}
                      value={year.id}
                    >
                      {year.name}
                      {year.status ===
                      "ACTIVE"
                        ? " — Active"
                        : ""}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Term">
              <select
                value={
                  feeForm.term_id
                }
                onChange={(event) =>
                  setFeeForm(
                    (current) => ({
                      ...current,
                      term_id:
                        event.target
                          .value,
                    })
                  )
                }
                required
              >
                <option value="">
                  Select term
                </option>

                {availableTerms.map(
                  (term) => (
                    <option
                      key={term.id}
                      value={term.id}
                    >
                      {term.name}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Class">
              <select
                value={
                  feeForm.class_id
                }
                onChange={(event) =>
                  setFeeForm(
                    (current) => ({
                      ...current,
                      class_id:
                        event.target
                          .value,
                    })
                  )
                }
                required
              >
                <option value="">
                  Select class
                </option>

                {classes.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                      {item.level
                        ? ` — ${item.level}`
                        : ""}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Fee Type">
              <input
                type="text"
                value={
                  feeForm.fee_type
                }
                onChange={(event) =>
                  setFeeForm(
                    (current) => ({
                      ...current,
                      fee_type:
                        event.target
                          .value,
                    })
                  )
                }
                placeholder="e.g. Tuition Fee, Registration Fee"
                required
              />
            </Field>

            <Field label="Amount">
              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  feeForm.amount
                }
                onChange={(event) =>
                  setFeeForm(
                    (current) => ({
                      ...current,
                      amount:
                        event.target
                          .value,
                    })
                  )
                }
                placeholder="Enter fee amount"
                required
              />
            </Field>

            <Field label="Due Date">
              <input
                type="date"
                value={
                  feeForm.due_date
                }
                onChange={(event) =>
                  setFeeForm(
                    (current) => ({
                      ...current,
                      due_date:
                        event.target
                          .value,
                    })
                  )
                }
              />
            </Field>

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                gap: "10px",
                paddingTop:
                  "8px",
                borderTop:
                  "1px solid #eee",
              }}
            >
              <button
                type="button"
                onClick={
                  closeFeeModal
                }
                disabled={
                  feeSaving
                }
              >
                Cancel
              </button>

              <button
                className="primary"
                type="submit"
                disabled={
                  feeSaving
                }
              >
                {feeSaving
                  ? "Saving..."
                  : editingFee
                  ? "Update Fee"
                  : "Save Fee"}
              </button>
            </div>

          </form>

        </Modal>
      )}

      {/* =================================================
          PAYMENT MODAL
      ================================================= */}

      {paymentModal && (
        <Modal
          title={
            editingPayment
              ? "Edit Payment"
              : "Record Payment"
          }
          onClose={
            closePaymentModal
          }
        >

          <form
            onSubmit={savePayment}
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "18px",
            }}
          >

            <Field label="Student">
              <select
                value={
                  form.student_id
                }
                onChange={(event) =>
                  handleStudentChange(
                    event.target
                      .value
                  )
                }
                required
                disabled={Boolean(
                  editingPayment
                )}
              >
                <option value="">
                  Select student
                </option>

                {students
                  .filter(
                    (student) =>
                      student.status ===
                        "active" ||
                      Number(
                        student.id
                      ) ===
                        Number(
                          form.student_id
                        )
                  )
                  .map(
                    (student) => (
                      <option
                        key={
                          student.id
                        }
                        value={
                          student.id
                        }
                      >
                        {student.admissionNo
                          ? `${student.admissionNo} — `
                          : ""}
                        {getStudentName(
                          student
                        )}
                      </option>
                    )
                  )}
              </select>
            </Field>

            {/* STUDENT SUMMARY */}

            {selectedStudent && (
              <div
                style={{
                  padding:
                    "16px",
                  borderRadius:
                    "10px",
                  background:
                    "#f5f7fa",
                  border:
                    "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    marginBottom:
                      "8px",
                  }}
                >
                  <strong>
                    {getStudentName(
                      selectedStudent
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    fontSize:
                      "14px",
                    color:
                      "#666",
                  }}
                >
                  Admission No:{" "}
                  {selectedStudent.admissionNo ||
                    "—"}
                </div>

                {balanceLoading ? (
                  <div
                    style={{
                      marginTop:
                        "10px",
                    }}
                  >
                    Loading balance...
                  </div>
                ) : balance ? (
                  <div
                    style={{
                      marginTop:
                        "14px",
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(3, minmax(0, 1fr))",
                      gap:
                        "10px",
                    }}
                  >

                    <div
                      style={{
                        background:
                          "#fff",
                        padding:
                          "10px",
                        borderRadius:
                          "8px",
                      }}
                    >
                      <small>
                        Total Fees
                      </small>

                      <strong
                        style={{
                          display:
                            "block",
                          marginTop:
                            "4px",
                        }}
                      >
                        {fmtMoney(
                          balance.total_fees
                        )}
                      </strong>
                    </div>

                    <div
                      style={{
                        background:
                          "#fff",
                        padding:
                          "10px",
                        borderRadius:
                          "8px",
                      }}
                    >
                      <small>
                        Paid
                      </small>

                      <strong
                        style={{
                          display:
                            "block",
                          marginTop:
                            "4px",
                        }}
                      >
                        {fmtMoney(
                          balance.total_paid
                        )}
                      </strong>
                    </div>

                    <div
                      style={{
                        background:
                          "#fff",
                        padding:
                          "10px",
                        borderRadius:
                          "8px",
                      }}
                    >
                      <small>
                        Balance
                      </small>

                      <strong
                        style={{
                          display:
                            "block",
                          marginTop:
                            "4px",
                        }}
                      >
                        {fmtMoney(
                          balance.balance
                        )}
                      </strong>
                    </div>

                  </div>
                ) : null}

              </div>
            )}

            <Field label="Fee Structure">
              <select
                value={
                  form.fee_structure_id
                }
                onChange={(event) =>
                  handleFeeChange(
                    event.target
                      .value
                  )
                }
                required
              >
                <option value="">
                  Select fee
                </option>

                {availablePaymentFees.map(
                  (fee) => (
                    <option
                      key={
                        fee.id
                      }
                      value={
                        fee.id
                      }
                    >
                      {fee.feeName} —{" "}
                      {fmtMoney(
                        fee.amount
                      )}
                    </option>
                  )
                )}
              </select>

              {selectedStudent &&
                availablePaymentFees.length ===
                  0 && (
                  <small
                    style={{
                      display:
                        "block",
                      marginTop:
                        "6px",
                      color:
                        "#b91c1c",
                    }}
                  >
                    No fee structure has
                    been configured for
                    this student's class.
                  </small>
                )}
            </Field>

            <Field label="Amount">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={
                  form.amount
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      amount:
                        event.target
                          .value,
                    })
                  )
                }
                required
              />
            </Field>

            <Field label="Payment Date">
              <input
                type="date"
                value={
                  form.payment_date
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      payment_date:
                        event.target
                          .value,
                    })
                  )
                }
                required
              />
            </Field>

            <Field label="Payment Method">
              <select
                value={
                  form.payment_method
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      payment_method:
                        event.target
                          .value,
                    })
                  )
                }
                required
              >
                <option value="CASH">
                  Cash
                </option>

                <option value="BANK">
                  Bank
                </option>

                <option value="MOBILE_MONEY">
                  Mobile Money
                </option>

                <option value="CARD">
                  Card
                </option>

                <option value="OTHER">
                  Other
                </option>
              </select>
            </Field>

            <Field label="Reference Number">
              <input
                type="text"
                value={
                  form.reference_number
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      reference_number:
                        event.target
                          .value,
                    })
                  )
                }
                placeholder="Bank / mobile transaction reference"
              />
            </Field>

            <Field label="Remarks">
              <textarea
                value={
                  form.remarks
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      remarks:
                        event.target
                          .value,
                    })
                  )
                }
                placeholder="Optional remarks"
                rows={3}
              />
            </Field>

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                gap: "10px",
                paddingTop:
                  "8px",
                borderTop:
                  "1px solid #eee",
              }}
            >
              <button
                type="button"
                onClick={
                  closePaymentModal
                }
                disabled={
                  saving
                }
              >
                Cancel
              </button>

              <button
                className="primary"
                type="submit"
                disabled={
                  saving
                }
              >
                {saving
                  ? "Saving..."
                  : editingPayment
                  ? "Update Payment"
                  : "Save Payment"}
              </button>
            </div>

          </form>

        </Modal>
      )}

      {/* =================================================
          RECEIPT PREVIEW
      ================================================= */}

      {receiptPayment && (
        <Modal
          title="Payment Receipt"
          onClose={() =>
            setReceiptPayment(
              null
            )
          }
        >
          <div
            style={{
              display:
                "flex",
              flexDirection:
                "column",
              gap: "16px",
            }}
          >
            <p>
              Receipt No:{" "}
              <strong>
                {getReceiptNumber(
                  receiptPayment
                )}
              </strong>
            </p>

            <button
              className="primary"
              type="button"
              onClick={() =>
                printReceipt(
                  receiptPayment
                )
              }
            >
              🖨 Print Receipt
            </button>
          </div>
        </Modal>
      )}

    </Page>
  );
}