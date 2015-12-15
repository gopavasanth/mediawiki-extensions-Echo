<?php

$IP = getenv( 'MW_INSTALL_PATH' );
if ( $IP === false ) {
	$IP = __DIR__ . '/../../..';
}
require_once ( "$IP/maintenance/Maintenance.php" );

class BackfillUnreadWikis extends Maintenance {
	public function __construct() {
		parent::__construct();

		$this->mDescription = "Backfill echo_unread_wikis table";

		$this->setBatchSize( 300 );
	}

	public function execute() {
		global $wgEchoSharedTrackingCluster;

		$dbr = wfGetDB( DB_SLAVE );
		$iterator = new BatchRowIterator( $dbr, 'user', 'user_id', $this->mBatchSize );
		$iterator->setFetchColumns( User::selectFields() );

		foreach ( $iterator as $batch ) {
			foreach ( $batch as $row ) {
				$user = User::newFromRow( $row );

				$notifUser = MWEchoNotifUser::newFromUser( $user );
				$uw = EchoUnreadWikis::newFromUser( $user );
				if ( $uw ) {
					$alertCount = $notifUser->getNotificationCount( false, DB_SLAVE, EchoAttributeManager::ALERT );
					$alertUnread = $notifUser->getLastUnreadNotificationTime( false, DB_SLAVE, EchoAttributeManager::ALERT );

					$msgCount = $notifUser->getNotificationCount( false, DB_SLAVE, EchoAttributeManager::MESSAGE );
					$msgUnread = $notifUser->getLastUnreadNotificationTime( false, DB_SLAVE, EchoAttributeManager::MESSAGE );

					$uw->updateCount( wfWikiID(), $alertCount, $alertUnread, $msgCount, $msgUnread );
				}
			}

			wfWaitForSlaves( false, false, $wgEchoSharedTrackingCluster );
		}
	}
}

$maintClass = "BackfillUnreadWikis";
require_once ( DO_MAINTENANCE );
