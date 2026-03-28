import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch platform settings
export async function GET() {
  try {
    // There should only be one settings record
    let settings = await db.platformSetting.findFirst();

    if (!settings) {
      // Create default settings if not exists
      settings = await db.platformSetting.create({
        data: {},
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update platform settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      platformFee,
      minWithdrawal,
      featuredListingPrice,
      premiumListingPrice,
      maintenanceMode,
      emailNotifications,
      smsNotifications,
      autoApproveBusinesses,
      requireIdVerification,
    } = body;

    // Find existing settings
    let settings = await db.platformSetting.findFirst();

    if (!settings) {
      // Create new settings
      settings = await db.platformSetting.create({
        data: {
          platformFee: platformFee ?? 15.0,
          minWithdrawal: minWithdrawal ?? 50.0,
          featuredListingPrice: featuredListingPrice ?? 99.0,
          premiumListingPrice: premiumListingPrice ?? 49.0,
          maintenanceMode: maintenanceMode ?? false,
          emailNotifications: emailNotifications ?? true,
          smsNotifications: smsNotifications ?? false,
          autoApproveBusinesses: autoApproveBusinesses ?? false,
          requireIdVerification: requireIdVerification ?? true,
        },
      });
    } else {
      // Update existing settings
      const updateData: Record<string, unknown> = {};
      
      if (platformFee !== undefined) updateData.platformFee = platformFee;
      if (minWithdrawal !== undefined) updateData.minWithdrawal = minWithdrawal;
      if (featuredListingPrice !== undefined) updateData.featuredListingPrice = featuredListingPrice;
      if (premiumListingPrice !== undefined) updateData.premiumListingPrice = premiumListingPrice;
      if (maintenanceMode !== undefined) updateData.maintenanceMode = maintenanceMode;
      if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
      if (smsNotifications !== undefined) updateData.smsNotifications = smsNotifications;
      if (autoApproveBusinesses !== undefined) updateData.autoApproveBusinesses = autoApproveBusinesses;
      if (requireIdVerification !== undefined) updateData.requireIdVerification = requireIdVerification;

      settings = await db.platformSetting.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
