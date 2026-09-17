import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, ClipboardCheck } from 'lucide-react';

import SectionEyebrow from '@/components/layout/SectionEyebrow';
import { getCurrentUser } from '@/services/auth';
import { deleteReport, getUserReports } from '@/services/reports';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

interface Report {
  id: string;
  user_id: string;
  claim_text: string;
  truth_score: number;
  verdict_label: string;
  ai_comments: unknown;
  source_links: unknown;
  created_at: string;
}

export default function DashboardPage({
  onNavigate,
}: DashboardPageProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    setError('');

    const user = await getCurrentUser();

    if (!user) {
      setError('You must be signed in to view your reports.');
      setLoading(false);
      return;
    }

    const { data, error: reportsError } = await getUserReports(user.id);

    if (reportsError) {
      setError(reportsError.message);
      setLoading(false);
      return;
    }

    setReports((data ?? []) as Report[]);
    setLoading(false);
  }

  async function handleDelete(reportId: string) {
    const { error: deleteError } = await deleteReport(reportId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setReports((currentReports) =>
      currentReports.filter((report) => report.id !== reportId)
    );
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function getSourceCount(sourceLinks: unknown) {
    if (Array.isArray(sourceLinks)) {
      return sourceLinks.length;
    }

    return 0;
  }

  return (
    <main className="simple-page dashboard-page">
      <div className="dashboard-top">
        <div>
          <SectionEyebrow>
            YOUR PRIVATE NOTEBOOK
          </SectionEyebrow>

          <h1>
            My <em>Reports</em>
          </h1>

          <p>
            Keep your questions, findings, and source trails close.
          </p>
        </div>

        <button
          className="dark-button"
          onClick={() => onNavigate('/verify')}
        >
          New verification
          <ArrowRight size={17} />
        </button>
      </div>

      <div className="reports-card paper-panel">
        <div className="report-heading">
          <h2>Recent investigations</h2>

          <span>
            {reports.length.toString().padStart(2, '0')} saved reports
          </span>
        </div>

        {loading && (
          <div className="report-row">
            <div className="report-claim">
              <h3>Loading your reports...</h3>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="report-row">
            <div className="report-claim">
              <h3>Unable to load reports</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="report-row">
            <div className="report-claim">
              <span>NO REPORTS YET</span>
              <h3>Your investigations will appear here.</h3>
            </div>

            <button
              className="report-view"
              onClick={() => onNavigate('/verify')}
            >
              Start verification
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          reports.map((report) => (
            <div
              className="report-row"
              key={report.id}
            >
              <div className="report-claim">
                <span>{formatDate(report.created_at)}</span>
                <h3>{report.claim_text}</h3>
              </div>

              <div className="report-verdict">
                <strong>{report.truth_score}%</strong>
                <span>{report.verdict_label}</span>
              </div>

              <div className="report-sources">
                {getSourceCount(report.source_links)} sources
              </div>

              <button
                className="report-view"
                onClick={() => onNavigate('/result')}
              >
                View report
                <ArrowUpRight size={15} />
              </button>

              <button
                className="delete-button"
                aria-label={`Delete report ${report.id}`}
                onClick={() => handleDelete(report.id)}
              >
                Delete
              </button>
            </div>
          ))}
      </div>

      <div className="dashboard-tip">
        <ClipboardCheck size={22} />

        <div>
          <strong>
            Your investigations, kept private.
          </strong>

          <p>
            Saved reports are stored securely in your NewsVera account.
          </p>
        </div>
      </div>
    </main>
  );
}