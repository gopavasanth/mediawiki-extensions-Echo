<?php

class EchoForeignPresentationModel extends EchoEventPresentationModel {
	public function getIconType() {
		return 'site';
	}

	public function getPrimaryLink() {
		return false;
	}

	protected function getHeaderMessageKey() {
		$data = $this->event->getExtra();
		$section = $data['section'];

		return "notification-header-{$this->type}-{$section}";
	}

	public function getHeaderMessage() {
		$msg = parent::getHeaderMessage();

		$data = $this->event->getExtra();
		$msg->params( reset( $data['wikis'] ) );
		$msg->numParams( count( $data['wikis'] ) - 1 );

		return $msg;
	}
}