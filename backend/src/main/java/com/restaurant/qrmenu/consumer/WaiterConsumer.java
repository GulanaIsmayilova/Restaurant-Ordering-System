package com.restaurant.qrmenu.consumer;

import com.restaurant.qrmenu.config.RabbitMQConfig;
import com.restaurant.qrmenu.dto.OrderResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class WaiterConsumer {

    private final SimpMessagingTemplate messagingTemplate;

    @RabbitListener(queues = RabbitMQConfig.WAITER_QUEUE)
    public void handleWaiterNotification(OrderResponse order) {
        log.info("WAITER CONSUMER triggered: orderId = {}, status = {}", order.getId(), order.getStatus());

        messagingTemplate.convertAndSend("/topic/waiter/orders", order);
    }
}
