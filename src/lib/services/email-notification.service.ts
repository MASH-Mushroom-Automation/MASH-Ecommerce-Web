/**
 * Email Notification Service
 * Issue #90 - Verification notification system
 */

import { NotificationType, NotificationPayload } from '@/lib/types/verification';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Generate email template based on notification type
 */
export function generateEmailTemplate(payload: NotificationPayload): EmailTemplate {
  switch (payload.type) {
    case NotificationType.SUBMISSION_RECEIVED:
      return getSubmissionReceivedTemplate(payload);
    
    case NotificationType.UNDER_REVIEW:
      return getUnderReviewTemplate(payload);
    
    case NotificationType.APPROVED:
      return getApprovedTemplate(payload);
    
    case NotificationType.REJECTED:
      return getRejectedTemplate(payload);
    
    case NotificationType.RESUBMISSION_RECEIVED:
      return getResubmissionReceivedTemplate(payload);
    
    case NotificationType.REMINDER:
      return getReminderTemplate(payload);
    
    default:
      throw new Error(`Unknown notification type: ${payload.type}`);
  }
}

/**
 * Send email notification
 */
export async function sendNotificationEmail(payload: NotificationPayload): Promise<boolean> {
  try {
    const template = generateEmailTemplate(payload);

    // TODO: Integrate with email service (SendGrid, AWS SES, Resend, etc.)
    // Example with SendGrid:
    // const msg = {
    //   to: payload.sellerEmail,
    //   from: process.env.SENDER_EMAIL,
    //   subject: template.subject,
    //   text: template.text,
    //   html: template.html,
    // };
    // await sgMail.send(msg);

    // Example with Resend:
    // await resend.emails.send({
    //   from: 'MASH <noreply@mash.com>',
    //   to: payload.sellerEmail,
    //   subject: template.subject,
    //   html: template.html,
    // });

    console.log(`[Email] Sent ${payload.type} notification to ${payload.sellerEmail}`);
    console.log(`[Email] Subject: ${template.subject}`);
    
    return true;
  } catch (error) {
    console.error('[Email] Failed to send notification:', error);
    return false;
  }
}

/**
 * Template: Submission Received
 */
function getSubmissionReceivedTemplate(payload: NotificationPayload): EmailTemplate {
  const subject = '✓ Verification Application Received - MASH';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        .timeline { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .timeline-item { display: flex; gap: 15px; margin-bottom: 15px; }
        .timeline-icon { width: 30px; height: 30px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Application Received!</h1>
        </div>
        <div class="content">
          <p>Hi ${payload.sellerName},</p>
          
          <p>Thank you for submitting your seller verification application to MASH. We've received your documents and they're now in our review queue.</p>
          
          <div class="timeline">
            <h3>What happens next?</h3>
            <div class="timeline-item">
              <div class="timeline-icon">1</div>
              <div>
                <strong>Review Process</strong><br>
                Our team will carefully review your submitted documents within 2-3 business days.
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-icon">2</div>
              <div>
                <strong>Status Update</strong><br>
                You'll receive an email notification once the review is complete.
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-icon">3</div>
              <div>
                <strong>Start Selling</strong><br>
                Once approved, you can immediately start listing your products!
              </div>
            </div>
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/seller/verification-status" class="button">
              Track Your Application
            </a>
          </p>
          
          <p style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
            <strong>💡 Pro Tip:</strong> While waiting, you can set up your seller profile and prepare your product listings!
          </p>
        </div>
        <div class="footer">
          <p>Submission ID: ${payload.submissionId}</p>
          <p>© 2025 MASH - Mushroom Automation Smart Habitat</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Verification Application Received - MASH

Hi ${payload.sellerName},

Thank you for submitting your seller verification application to MASH. We've received your documents and they're now in our review queue.

What happens next?

1. Review Process
   Our team will carefully review your submitted documents within 2-3 business days.

2. Status Update
   You'll receive an email notification once the review is complete.

3. Start Selling
   Once approved, you can immediately start listing your products!

Track your application: ${process.env.NEXT_PUBLIC_APP_URL}/seller/verification-status

Submission ID: ${payload.submissionId}

© 2025 MASH - Mushroom Automation Smart Habitat
  `;
  
  return { subject, html, text };
}

/**
 * Template: Under Review
 */
function getUnderReviewTemplate(payload: NotificationPayload): EmailTemplate {
  const subject = '👁️ Your Verification is Under Review - MASH';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👁️ Under Review</h1>
        </div>
        <div class="content">
          <p>Hi ${payload.sellerName},</p>
          
          <p>Good news! Our verification team has started reviewing your application. ${payload.metadata?.reviewerName ? `${payload.metadata.reviewerName} is currently reviewing your documents.` : ''}</p>
          
          <p>We're carefully verifying your business documents to ensure marketplace quality and security. This process typically takes 1-2 business days.</p>
          
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/seller/verification-status" class="button">
              Check Status
            </a>
          </p>
        </div>
        <div class="footer">
          <p>Submission ID: ${payload.submissionId}</p>
          <p>© 2025 MASH</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `Your Verification is Under Review - MASH\n\nHi ${payload.sellerName},\n\nGood news! Our verification team has started reviewing your application.\n\nCheck status: ${process.env.NEXT_PUBLIC_APP_URL}/seller/verification-status`;
  
  return { subject, html, text };
}

/**
 * Template: Approved
 */
function getApprovedTemplate(payload: NotificationPayload): EmailTemplate {
  const subject = '🎉 Congratulations! Your Seller Account is Verified - MASH';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        .badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; margin: 15px 0; }
        .next-steps { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .step { margin: 15px 0; padding-left: 30px; position: relative; }
        .step::before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="font-size: 32px; margin: 0;">🎉 Congratulations!</h1>
          <p style="font-size: 18px; margin: 10px 0 0 0;">You're Now a Verified Seller</p>
          <div class="badge">✓ VERIFIED SELLER</div>
        </div>
        <div class="content">
          <p>Hi ${payload.sellerName},</p>
          
          <p><strong>Excellent news!</strong> Your seller verification application has been approved. Welcome to the MASH marketplace!</p>
          
          <p>You can now enjoy all the benefits of being a verified seller:</p>
          
          <div class="next-steps">
            <h3 style="margin-top: 0;">🚀 Next Steps</h3>
            <div class="step">Create your first product listing</div>
            <div class="step">Set up your shipping preferences</div>
            <div class="step">Configure payment methods</div>
            <div class="step">Customize your seller profile</div>
            <div class="step">Start receiving orders!</div>
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/seller/dashboard" class="button">
              Go to Seller Dashboard
            </a>
          </p>
          
          <p style="background: #ecfdf5; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
            <strong>🌟 Verified Badge:</strong> Your profile now displays a verified badge, building trust with customers!
          </p>
        </div>
        <div class="footer">
          <p>Approved on: ${payload.metadata?.approvalDate ? new Date(payload.metadata.approvalDate).toLocaleDateString() : 'Today'}</p>
          <p>© 2025 MASH - Mushroom Automation Smart Habitat</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
🎉 Congratulations! Your Seller Account is Verified - MASH

Hi ${payload.sellerName},

Excellent news! Your seller verification application has been approved. Welcome to the MASH marketplace!

Next Steps:
✓ Create your first product listing
✓ Set up your shipping preferences
✓ Configure payment methods
✓ Customize your seller profile
✓ Start receiving orders!

Get started: ${process.env.NEXT_PUBLIC_APP_URL}/seller/dashboard

© 2025 MASH
  `;
  
  return { subject, html, text };
}

/**
 * Template: Rejected
 */
function getRejectedTemplate(payload: NotificationPayload): EmailTemplate {
  const subject = 'Action Required: Verification Application Needs Changes - MASH';
  
  const feedback = payload.metadata?.feedback || 'Please review and update your documents.';
  const requiredActions = payload.metadata?.requiredActions || [];
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        .feedback { background: #fee2e2; padding: 20px; border-radius: 6px; border-left: 4px solid #ef4444; margin: 20px 0; }
        .actions { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .action-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .action-item:last-child { border-bottom: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Action Required</h1>
        </div>
        <div class="content">
          <p>Hi ${payload.sellerName},</p>
          
          <p>Thank you for your patience during the verification process. After reviewing your application, we need you to make some changes before we can approve your seller account.</p>
          
          <div class="feedback">
            <h3 style="margin-top: 0; color: #991b1b;">Review Feedback:</h3>
            <p>${feedback}</p>
          </div>
          
          ${requiredActions.length > 0 ? `
          <div class="actions">
            <h3 style="margin-top: 0;">Required Actions:</h3>
            ${requiredActions.map(action => `
              <div class="action-item">• ${action}</div>
            `).join('')}
          </div>
          ` : ''}
          
          <p>Don't worry! You can easily resubmit your application with the updated documents. Our team is here to help if you have any questions.</p>
          
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/seller/verify-documents?resubmit=${payload.submissionId}" class="button">
              Resubmit Application
            </a>
          </p>
          
          <p style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
            <strong>Need Help?</strong> Contact our support team at support@mash.com if you have questions about the required changes.
          </p>
        </div>
        <div class="footer">
          <p>Submission ID: ${payload.submissionId}</p>
          <p>© 2025 MASH</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Action Required: Verification Application Needs Changes - MASH

Hi ${payload.sellerName},

After reviewing your application, we need you to make some changes before we can approve your seller account.

Review Feedback:
${feedback}

${requiredActions.length > 0 ? `
Required Actions:
${requiredActions.map(action => `• ${action}`).join('\n')}
` : ''}

Resubmit your application: ${process.env.NEXT_PUBLIC_APP_URL}/seller/verify-documents?resubmit=${payload.submissionId}

Need help? Contact: support@mash.com

© 2025 MASH
  `;
  
  return { subject, html, text };
}

/**
 * Template: Resubmission Received
 */
function getResubmissionReceivedTemplate(payload: NotificationPayload): EmailTemplate {
  const subject = '✓ Updated Application Received - MASH';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8b5cf6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Resubmission Received</h1>
        </div>
        <div class="content">
          <p>Hi ${payload.sellerName},</p>
          
          <p>Thank you for resubmitting your verification application with the updated documents. We've received your changes and will prioritize your review.</p>
          
          <p>Our team will carefully review your updated submission within 1-2 business days. We appreciate your prompt response!</p>
          
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/seller/verification-status" class="button">
              Track Your Application
            </a>
          </p>
        </div>
        <div class="footer">
          <p>Submission ID: ${payload.submissionId}</p>
          <p>© 2025 MASH</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `Resubmission Received - MASH\n\nHi ${payload.sellerName},\n\nThank you for resubmitting your verification application. We'll review it within 1-2 business days.\n\nTrack status: ${process.env.NEXT_PUBLIC_APP_URL}/seller/verification-status`;
  
  return { subject, html, text };
}

/**
 * Template: Reminder
 */
function getReminderTemplate(payload: NotificationPayload): EmailTemplate {
  const subject = 'Reminder: Complete Your Seller Verification - MASH';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Friendly Reminder</h1>
        </div>
        <div class="content">
          <p>Hi ${payload.sellerName},</p>
          
          <p>We noticed you haven't completed your seller verification yet. Complete your verification to unlock all seller features and start selling on MASH!</p>
          
          <p>Benefits of verification:</p>
          <ul>
            <li>✓ Verified badge on your profile</li>
            <li>✓ Access to premium seller features</li>
            <li>✓ Higher visibility in search</li>
            <li>✓ Increased buyer trust</li>
          </ul>
          
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/seller/verify-documents" class="button">
              Complete Verification
            </a>
          </p>
        </div>
        <div class="footer">
          <p>© 2025 MASH</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `Reminder: Complete Your Seller Verification - MASH\n\nHi ${payload.sellerName},\n\nComplete your verification to start selling on MASH!\n\nGet started: ${process.env.NEXT_PUBLIC_APP_URL}/seller/verify-documents`;
  
  return { subject, html, text };
}
